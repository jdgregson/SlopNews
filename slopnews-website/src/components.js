export const HEADER_HTML = `
    <header>
        <div class="header-content">
            <h1><a href="/" style="color: inherit; text-decoration: none;">SLOP News <span class="logo247">24/7</span></a></h1>
            <div class="category-selector">
                <div></div>
                <div class="current-category">All Stories</div>
                <button class="menu-toggle" id="menu-toggle">☰</button>
                <div></div>
            </div>
        </div>
        <nav id="category-nav">
            <a href="/" class="nav-link">All Stories</a>
            <a href="/gallery" class="nav-link">Gallery</a>
        </nav>
        <div class="headlines-marquee">
            <span id="headlines-text"></span>
        </div>
    </header>`;

export const FOOTER_HTML = `
    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h4>News</h4>
                <ul id="news-categories">
                    <li><a href="/">All Stories</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Features</h4>
                <ul id="feature-categories">
                    <li><a href="/">All Stories</a></li>
                    <li><a href="/gallery">Gallery</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>About</h4>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Contact</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Advertise</a></li>
                    <li><a href="#">Press</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Support</h4>
                <ul>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Cookie Policy</a></li>
                    <li><a href="#">Accessibility</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Subscribe</h4>
                <ul>
                    <li><a href="#">Newsletter</a></li>
                    <li><a href="#">RSS Feeds</a></li>
                    <li><a href="#">Mobile Apps</a></li>
                    <li><a href="#">Social Media</a></li>
                    <li><a href="#">Podcasts</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>API</h4>
                <ul>
                    <li><a href="/api/stories">All Stories</a></li>
                    <li><a href="/api/stories?offset=20">All Stories (Page 2)</a></li>
                    <li><a href="/api/stories?snippet=true">Stories with Snippets</a></li>
                    <li><a href="/api/stories?category=Technology">By Category</a></li>
                    <li><a href="/api/stories?limit=10">Latest Stories</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Archives</h4>
                <ul>
                    <li><a href="#">2024</a></li>
                    <li><a href="#">2023</a></li>
                    <li><a href="#">2022</a></li>
                    <li><a href="#">2021</a></li>
                    <li><a href="#">2020</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Tools</h4>
                <ul>
                    <li><a href="#">Weather</a></li>
                    <li><a href="#">Currency Converter</a></li>
                    <li><a href="#">Stock Market</a></li>
                    <li><a href="#">Sports Scores</a></li>
                    <li><a href="/api/stories/1">Single Story</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© <script>document.write(new Date().getFullYear())</script> SLOP News 24/7. All rights reserved.</p><br><p>This site and all content herein is a parody of real or imagined news and is not affiliated with any real news organization. <a href="/disclaimer">More information</a></p>
        </div>
    </footer>`;

export const SHARED_STYLES = `
    body {
        font-family: Georgia, 'Times New Roman', Times, serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background: #fff;
        color: #333;
        overflow-x: hidden;
    }
    header {
        border-bottom: 2px solid #000;
        padding: 1rem 0;
        margin-bottom: 2rem;
    }
    header h1 {
        margin: 0;
        font-size: 3rem;
        text-align: center;
        font-weight: bold;
        letter-spacing: -1px;
    }
    .logo247 {
        background-color: black;
        color: #ff0000;
        font-weight: normal;
        vertical-align: top;
        padding: 5px 15px 11px 15px;
        border-top-right-radius: 20px;
        border-bottom-left-radius: 20px;
    }
    nav {
        border-bottom: 1px solid #ccc;
        padding: 0.5rem 0;
        margin-bottom: 2rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
    }
    nav a {
        color: #333;
        text-decoration: none;
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 0.25rem 0.5rem;
        white-space: nowrap;
    }
    nav a:hover, nav a.active {
        color: #666;
        background: #f5f5f5;
        border-radius: 4px;
    }
    .menu-toggle {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #333;
    }
    .header-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding: 1rem 0;
    }
    .category-selector {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
        padding: 0 1rem;
        cursor: pointer;
    }
    .current-category {
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
    }
    .headlines-marquee {
        display: none;
    }
    @media (min-width: 450px) {
        .category-selector, .current-category {
            display: none;
        }
        .headlines-marquee {
            display: block !important;
            background: #f8f8f8;
            padding: 0.5rem 0;
            border-bottom: 2px solid red;
            margin-bottom: 2rem;
            overflow: hidden;
            height: 24px;
            white-space: nowrap;
        }
        .headlines-marquee span {
            display: inline-block;
            animation: marquee 45s linear infinite;
            color: red;
            font-size: 1.1rem;
            font-weight: bold;
            white-space: nowrap;
        }
        @keyframes marquee {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
        }
    }
    @media (max-width: 450px) {
        body {
            overflow-x: hidden;
        }
        .category-selector {
            width: 100%;
            justify-content: space-between;
            padding: 0;
            margin-top: 30px;
            background-color: #e7e7e7;
        }
        .menu-toggle {
            display: block;
            padding: 0.25rem 0.5rem;
        }
        nav {
            display: none;
            flex-direction: column;
            align-items: center;
            padding: 1rem 0;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid #ccc;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        nav.active {
            display: flex;
        }
        nav a {
            width: 100%;
            text-align: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;
        }
        nav a:last-child {
            border-bottom: none;
        }
        .current-category {
            display: block;
        }
        header {
            position: relative;
        }
    }
    footer {
        margin-top: 4rem;
        padding: 3rem 0;
        background: #f8f8f8;
        border-top: 1px solid #eee;
    }
    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
    }
    .footer-section h4 {
        color: #333;
        font-size: 1.1rem;
        margin: 0 0 1rem 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .footer-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .footer-section li {
        margin-bottom: 0.5rem;
    }
    .footer-section a {
        color: #666;
        text-decoration: none;
        font-size: 0.9rem;
    }
    .footer-section a:hover {
        color: #333;
    }
    .footer-bottom {
        max-width: 1200px;
        margin: 2rem auto 0;
        padding: 1.5rem 20px 0;
        border-top: 1px solid #ddd;
        text-align: center;
        color: #666;
        font-size: 0.9rem;
    }
    @media (max-width: 768px) {
        .footer-content {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (max-width: 450px) {
        .footer-content {
            grid-template-columns: 1fr;
        }
    }`;

export const SHARED_SCRIPTS = `
    // Function to convert line breaks to HTML
    function parseMarkdown(text) {
        if (!text) return '';
        return text.replace(/\\n/g, '<br>');
    }

    // Function to load and cache existing categories
    async function loadExistingCategories() {
        if (window.existingCategories) return window.existingCategories;

        try {
            const response = await fetch('/api/categories');
            window.existingCategories = await response.json();
            return window.existingCategories;
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }

    // Function to render navigation
    async function renderNavigation() {
        const categories = await loadExistingCategories();
        const nav = document.getElementById('category-nav');
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category');
        const isGalleryPage = window.location.pathname === '/gallery';

        // Keep the Home link and add Gallery
        let navHtml = '<a href="/" class="nav-link' + (!currentCategory && !isGalleryPage ? ' active' : '') + '">All Stories</a>' +
                     '<a href="/gallery" class="nav-link' + (isGalleryPage ? ' active' : '') + '">Gallery</a>';

        // Add only categories that exist in the database
        categories.forEach(category => {
            const isActive = category === currentCategory;
            navHtml += '<a href="/?category=' + encodeURIComponent(category) + '" class="nav-link' + (isActive ? ' active' : '') + '">' + category + '</a>';
        });

        nav.innerHTML = navHtml;

        // Update current category display
        const categoryDisplay = document.querySelector('.current-category');
        if (categoryDisplay) {
            categoryDisplay.textContent = isGalleryPage ? 'Gallery' : (currentCategory || 'All Stories');
        }

        // Update footer categories
        const newsCategories = document.getElementById('news-categories');
        const featureCategories = document.getElementById('feature-categories');

        if (newsCategories && featureCategories) {
            // Split categories between news and features sections
            const midPoint = Math.ceil(categories.length / 2);
            const newsSection = categories.slice(0, midPoint);
            const featureSection = categories.slice(midPoint);

            // Update news categories
            newsCategories.innerHTML = '<li><a href="/">All Stories</a></li>' +
                                     '<li><a href="/gallery">Gallery</a></li>' +
                newsSection.map(category =>
                    '<li><a href="/?category=' + encodeURIComponent(category) + '">' + category + '</a></li>'
                ).join('');

            // Update feature categories
            featureCategories.innerHTML = '<li><a href="/">All Stories</a></li>' +
                                        '<li><a href="/gallery">Gallery</a></li>' +
                featureSection.map(category =>
                    '<li><a href="/?category=' + encodeURIComponent(category) + '">' + category + '</a></li>'
                ).join('');
        }
    }

    // Add menu toggle functionality
    document.querySelector('.category-selector').addEventListener('click', (e) => {
        e.stopPropagation();
        const nav = document.getElementById('category-nav');
        nav.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.getElementById('category-nav');
        const categorySelector = document.querySelector('.category-selector');
        if (!nav.contains(e.target) && !categorySelector.contains(e.target)) {
            nav.classList.remove('active');
        }
    });

    // Function to update headlines marquee
    async function updateHeadlinesMarquee() {
        try {
            console.log('Fetching headlines...');
            const response = await fetch('/api/stories?limit=10');
            const data = await response.json();
            console.log('Received headlines:', data.stories);
            const headlines = data.stories.map(story => story.title).join(' • ');
            console.log('Formatted headlines:', headlines);
            const marqueeText = document.getElementById('headlines-text');
            marqueeText.textContent = headlines + ' • ' + headlines;
            console.log('Updated marquee text');
        } catch (error) {
            console.error('Error loading headlines:', error);
        }
    }
    function handleImageError(img) {
        const colors = [
            [150, 130, 130],
            [120, 140, 140],
            [160, 160, 130],
            [130, 130, 150],
            [180, 170, 160],
            [140, 150, 180],
            [170, 130, 160],
            [160, 140, 150],
            [130, 160, 140],
        ];
        const picked = colors.sort(() => 0.5 - Math.random()).slice(0, 4);
        const circles = picked
            .map((c, i) => {
            const cx = Math.random() * 300;
            const cy = Math.random() * 200;
            const r = 100 + Math.random() * 50;
            return \`<radialGradient id="grad\${i}" cx="\${cx}" cy="\${cy}" r="\${r}" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="rgb(\${c.join(
                        ','
                    )})" stop-opacity="1"/>
                    <stop offset="100%" stop-color="rgb(\${c.join(
                        ','
                    )})" stop-opacity="0"/>
                    </radialGradient>
                    <circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="url(#grad\${i})"/>\`;
            })
            .join('');

        const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
            <defs>\${circles}</defs>
            <rect width="300" height="200" fill="#111"/>
            \${circles}
        </svg>\`;

        const placeholderImage = 'data:image/svg+xml;base64,' + btoa(svg);
        const wrapper = document.createElement('div');
        wrapper.className = 'img-wrapper';
        const clone = img.cloneNode();
        clone.src = placeholderImage;
        wrapper.appendChild(clone);
        img.replaceWith(wrapper);
        }
    `;

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'SLOP News 24/7',
  url: 'https://slop247.com',
  logo: 'https://slop247.com/logo.png',
  description:
    'Southern Louisiana Operationalized Partition - Your trusted source for news and analysis to get you through the hour.',
};
