# Ajay's Blog Website

A modern, responsive blog website built with pure HTML, CSS, and JavaScript, featuring a Node.js backend with MongoDB database and admin panel for content management.

## Features

### Frontend
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean and professional design with smooth animations
- **Interactive Navigation**: Mobile-friendly hamburger menu with smooth scrolling
- **Blog Grid**: Beautiful card-based layout for blog posts
- **Contact Form**: Functional contact form with validation
- **Modal System**: Click "Read More" to view full blog posts in modal windows
- **Scroll Animations**: Elements fade in as you scroll
- **Notification System**: User-friendly notifications for form submissions

### Backend & Admin Panel
- **Node.js Server**: RESTful API with Express.js
- **MongoDB Database**: NoSQL database for blog posts and admin users
- **Admin Authentication**: Secure JWT-based authentication system
- **Blog Management**: Full CRUD operations for blog posts
- **Image Upload**: Support for featured images with Multer
- **Draft System**: Save posts as drafts before publishing
- **Category Management**: Organize posts by categories
- **Responsive Admin Panel**: Mobile-friendly admin interface

## Structure

```
ajay-blog-website-/
├── server.js           # Node.js server and API endpoints
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── setup.sh            # Setup script
├── index.html          # Main website HTML
├── styles.css          # Frontend styling
├── script.js           # Frontend JavaScript
├── admin/              # Admin panel files
│   ├── index.html      # Admin panel HTML
│   ├── admin.css       # Admin panel styling
│   └── admin.js        # Admin panel JavaScript
├── uploads/            # Uploaded images directory
└── README.md           # Project documentation
```

## Technologies Used

### Frontend
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks required, pure JS for all interactions

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for REST API
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for authentication
- **Multer**: Middleware for file uploads
- **bcryptjs**: Password hashing

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/iampownkumar/ajay-blog-website.git
   cd ajay-blog-website
   ```

2. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start MongoDB**:
   ```bash
   mongod
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

### Manual Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Create uploads directory**:
   ```bash
   mkdir uploads
   ```

4. **Start the application**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Admin Panel

### Default Login
- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the default password in production!

### Features
- **Dashboard**: Overview with statistics and recent posts
- **Blog Management**: Create, edit, delete, and publish posts
- **Image Upload**: Add featured images to posts
- **Category Management**: View and organize categories
- **Draft System**: Save posts as drafts before publishing
- **Responsive Design**: Works on all devices

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Blog Posts
- `GET /api/blogs` - Get all blog posts (with pagination and filtering)
- `GET /api/blogs/:id` - Get single blog post
- `POST /api/blogs` - Create new blog post (authenticated)
- `PUT /api/blogs/:id` - Update blog post (authenticated)
- `DELETE /api/blogs/:id` - Delete blog post (authenticated)

### Categories
- `GET /api/categories` - Get all categories

## Frontend Sections

1. **Header**: Fixed navigation with smooth scroll links
2. **Hero**: Eye-catching introduction section
3. **About**: Personal information and skills
4. **Blog**: Dynamic blog posts loaded from API
5. **Contact**: Contact form and information
6. **Footer**: Links and copyright information

## Configuration

### Environment Variables (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ajay-blog

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Customization

### Adding New Blog Posts
Use the admin panel at `/admin` to create and manage blog posts.

### Changing Colors
Modify the CSS variables in `styles.css` and `admin/admin.css`.

### Adding New Sections
1. Add HTML structure to `index.html`
2. Style it in `styles.css`
3. Add JavaScript interactions to `script.js`

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB URI
3. Set a strong JWT_SECRET
4. Use a process manager like PM2
5. Set up reverse proxy with Nginx (optional)

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ajay-blog
JWT_SECRET=your-very-strong-secret-key
PORT=3000
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
