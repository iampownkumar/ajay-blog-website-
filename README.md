# Ajay's Blog Website

A modern, responsive blog website built with pure HTML, CSS, and JavaScript.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean and professional design with smooth animations
- **Interactive Navigation**: Mobile-friendly hamburger menu with smooth scrolling
- **Blog Grid**: Beautiful card-based layout for blog posts
- **Contact Form**: Functional contact form with validation
- **Modal System**: Click "Read More" to view full blog posts in modal windows
- **Scroll Animations**: Elements fade in as you scroll
- **Notification System**: User-friendly notifications for form submissions

## Structure

```
ajay-blog-website-/
├── index.html      # Main HTML structure
├── styles.css      # Complete CSS styling
├── script.js       # Interactive JavaScript features
├── README.md       # Project documentation
└── .gitignore      # Git ignore file
```

## Sections

1. **Header**: Fixed navigation with smooth scroll links
2. **Hero**: Eye-catching introduction section
3. **About**: Personal information and skills
4. **Blog**: Grid of blog posts with modal functionality
5. **Contact**: Contact form and information
6. **Footer**: Links and copyright information

## Technologies Used

- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks required, pure JS for all interactions

## Key Features

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Hamburger menu for mobile navigation
- Flexible grid layouts

### Interactive Elements
- Smooth scrolling navigation
- Hover effects on cards and buttons
- Modal windows for blog posts
- Form validation and submission feedback
- Scroll-triggered animations

### Performance
- Optimized CSS with minimal dependencies
- Efficient JavaScript with event delegation
- Fast loading with no external libraries

## Getting Started

1. Clone or download the files
2. Open `index.html` in your web browser
3. No build process or server required!

## Customization

### Adding New Blog Posts
Edit the blog section in `index.html`:

```html
<article class="blog-card">
    <div class="blog-image">
        <div class="placeholder-image"></div>
    </div>
    <div class="blog-content">
        <div class="blog-meta">
            <span class="date">Your Date</span>
            <span class="category">Your Category</span>
        </div>
        <h3>Your Blog Title</h3>
        <p>Your blog excerpt...</p>
        <a href="#" class="read-more">Read More →</a>
    </div>
</article>
```

### Changing Colors
Modify the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --accent-color: #e74c3c;
    --background-color: #f8f9fa;
}
```

### Adding New Sections
1. Add the HTML structure to `index.html`
2. Style it in `styles.css`
3. Add any JavaScript interactions to `script.js`

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available under the MIT License.
