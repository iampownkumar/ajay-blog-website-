const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ajay-blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    date: { type: Date, default: Date.now },
    published: { type: Boolean, default: true },
    image: String,
    readTime: Number
});

const Blog = mongoose.model('Blog', blogSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

const Category = mongoose.model('Category', categorySchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Image Upload Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Serve main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve post page
app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, 'post.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// API Routes

// Get all blogs with pagination and filtering
app.get('/api/blogs', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, published, search } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (published !== undefined) query.published = published === 'true';
        
        // Add search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const blogs = await Blog.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Blog.countDocuments(query);

        res.json({
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single blog
app.get('/api/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new blog
app.post('/api/blogs', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, published, readTime } = req.body;
        
        const blogData = {
            title,
            excerpt,
            content,
            category,
            published: published === 'true',
            readTime: readTime || Math.ceil(content.length / 1000) // Estimate read time
        };

        if (tags) {
            blogData.tags = tags.split(',').map(tag => tag.trim());
        }

        if (req.file) {
            blogData.image = `/uploads/${req.file.filename}`;
        }

        const blog = new Blog(blogData);
        await blog.save();

        // Update categories
        await Category.findOneAndUpdate(
            { name: category },
            { name: category },
            { upsert: true }
        );

        res.status(201).json(blog);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update blog
app.put('/api/blogs/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, published, readTime } = req.body;
        
        const updateData = {
            title,
            excerpt,
            content,
            category,
            published: published === 'true',
            readTime: readTime || Math.ceil(content.length / 1000)
        };

        if (tags) {
            updateData.tags = tags.split(',').map(tag => tag.trim());
        }

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Update categories
        await Category.findOneAndUpdate(
            { name: category },
            { name: category },
            { upsert: true }
        );

        res.json(blog);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete blog
app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Blog.distinct('category');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin Authentication
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // For demo purposes, use default admin
        if (username === 'admin' && password === 'admin123') {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        } else {
            // Check if admin exists in database
            const admin = await Admin.findOne({ username });
            if (!admin || !await bcrypt.compare(password, admin.password)) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create admin (for setup)
app.post('/api/admin/create', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = new Admin({
            username,
            password: hashedPassword
        });
        
        await admin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
