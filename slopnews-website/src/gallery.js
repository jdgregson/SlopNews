import {
  HEADER_HTML,
  FOOTER_HTML,
  SHARED_STYLES,
  SHARED_SCRIPTS,
} from './components.js';

export const GALLERY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gallery - SLOP News 24/7</title>
    <link rel="icon" href="https://image.slop247.com/icon.png?23">
    <meta name="description" content="Browse news images from SLOP News 24/7">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="SLOP News 24/7">
    <meta property="og:title" content="Gallery - SLOP News 24/7">
    <meta property="og:description" content="Browse news images from SLOP News 24/7">
    <style>
        ${SHARED_STYLES}
        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0 20px;
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px 0;
        }
        .gallery-item {
            position: relative;
            aspect-ratio: 16/9;
            overflow: hidden;
            cursor: pointer;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .gallery-item:hover {
            transform: scale(1.02);
        }
        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            padding: 20px;
            box-sizing: border-box;
        }
        .modal-content {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        }
        .modal-image {
            width: 100%;
            max-height: 70vh;
            object-fit: contain;
            background-color: #000000;
        }
        .modal-story {
            padding: 20px;
            background: white;
            overflow-y: auto;
        }
        .modal-story h3 {
            margin: 0 0 10px 0;
            font-size: 1.5rem;
        }
        .modal-story p {
            margin: 0 0 15px 0;
            line-height: 1.6;
        }
        .modal-story a {
            color: #0066cc;
            text-decoration: none;
        }
        .modal-story a:hover {
            text-decoration: underline;
        }
        .close-modal {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .loading {
            text-align: center;
            padding: 20px;
            font-size: 1.2rem;
            color: #666;
        }
        @media (max-width: 768px) {
            .gallery {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
            .modal-content {
                max-height: 95vh;
            }
            .modal-image {
                max-height: 50vh;
            }
        }
    </style>
</head>
<body>
    ${HEADER_HTML}
    <div class="container">
        <div id="gallery" class="gallery"></div>
        <div id="loading" class="loading" style="display: none;">Loading more images...</div>
    </div>
    <div id="modal" class="modal">
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <img id="modal-image" class="modal-image" src="" alt="">
            <div id="modal-story" class="modal-story"></div>
        </div>
    </div>
    ${FOOTER_HTML}

    <script>
        ${SHARED_SCRIPTS}
        let page = 1;
        let loading = false;
        let hasMore = true;
        let currentBatch = [];
        let currentIndex = 0;
        let isLoadingBatch = false;

        async function loadNextBatch() {
            if (loading || !hasMore || isLoadingBatch) return;

            loading = true;
            isLoadingBatch = true;
            document.getElementById('loading').style.display = 'block';

            try {
                console.log('Loading page:', page);
                const response = await fetch('/api/gallery?page=' + page + '&limit=10');
                const data = await response.json();
                console.log('Received data:', data);

                if (!data.images || data.images.length === 0) {
                    console.log('No more images to load');
                    hasMore = false;
                    document.getElementById('loading').style.display = 'none';
                    return;
                }

                currentBatch = data.images;
                currentIndex = 0;
                page++;
                console.log('Page incremented to:', page);
                console.log('Starting to load batch of', currentBatch.length, 'images');

                // Start loading the first image
                loadNextImage();
            } catch (error) {
                console.error('Error loading images:', error);
                loading = false;
                isLoadingBatch = false;
                document.getElementById('loading').style.display = 'none';
            }
        }

        function loadNextImage() {
            console.log('loadNextImage called, currentIndex:', currentIndex, 'batch length:', currentBatch.length);

            if (currentIndex >= currentBatch.length) {
                console.log('Batch complete');
                loading = false;
                isLoadingBatch = false;
                document.getElementById('loading').style.display = 'none';
                return;
            }

            const item = currentBatch[currentIndex];
            console.log('Loading image:', item.image);

            if (!item.image) {
                console.log('Skipping item without image');
                currentIndex++;
                loadNextImage();
                return;
            }

            const gallery = document.getElementById('gallery');
            const div = document.createElement('div');
            div.className = 'gallery-item';

            // Create and append the image directly
            div.innerHTML = \`
                <img src="\${item.image}?width=600&height=400&fit=cover"
                     alt="\${item.title}"
                     loading="lazy">
            \`;
            div.onclick = () => openModal(item);
            gallery.appendChild(div);

            // Move to next image after a short delay
            currentIndex++;
            setTimeout(loadNextImage, 100);
        }

        function openModal(item) {
            const modal = document.getElementById('modal');
            const modalImage = document.getElementById('modal-image');
            const modalStory = document.getElementById('modal-story');

            modalImage.src = item.image;
            modalImage.alt = item.title;

            modalStory.innerHTML = \`
                <h3>\${item.title}</h3>
                <p>\${item.content.substring(0, 200)}...</p>
                <a href="/story/\${item.id}" target="_blank">Read full story</a>
            \`;

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Close modal when clicking the close button or outside the modal content
        document.querySelector('.close-modal').onclick = () => {
            document.getElementById('modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        document.getElementById('modal').onclick = (e) => {
            if (e.target === document.getElementById('modal')) {
                document.getElementById('modal').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };

        // Initialize infinite scroll
        function initInfiniteScroll() {
            window.addEventListener('scroll', () => {
                if (loading || !hasMore) return;

                const gallery = document.getElementById('gallery');
                const galleryBottom = gallery.getBoundingClientRect().bottom;
                const viewportHeight = window.innerHeight;

                // Load more when user is within 500px of the gallery's bottom
                if (galleryBottom - viewportHeight < 500) {
                    console.log('Near gallery bottom, loading more...');
                    loadNextBatch();
                }
            });
        }

        // Initial load and setup
        window.addEventListener('load', () => {
            console.log('Page loaded, initializing gallery...');
            // Only load the first batch initially
            loadNextBatch();
            initInfiniteScroll();
            renderNavigation();
            updateHeadlinesMarquee();
        });
    </script>
</body>
</html>`;