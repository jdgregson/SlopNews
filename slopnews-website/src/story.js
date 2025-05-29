import {
  HEADER_HTML,
  FOOTER_HTML,
  SHARED_STYLES,
  SHARED_SCRIPTS,
  ORGANIZATION_SCHEMA,
} from './components.js';

export const STORY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story - SLOP News 24/7</title>
    <meta name="description" content="Southern Louisiana Operationalized Partition - Your trusted source for news and analysis to get you through the hour">
    <meta name="keywords" content="news, Louisiana, Southern Louisiana, operational news, partition analysis">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="SLOP News 24/7">
    <meta property="og:title" content="Story - SLOP News 24/7">
    <meta property="og:description" content="Southern Louisiana Operationalized Partition - Your trusted source for news and analysis to get you through the hour">
    <meta property="og:image" content="">
    <script type="application/ld+json">
    ${JSON.stringify(ORGANIZATION_SCHEMA)}
    </script>
    <style>
        ${SHARED_STYLES}
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .story {
            margin: 2rem 0;
        }
        .story-header {
            margin-bottom: 2rem;
        }
        .story .category {
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .story h2 {
            margin: 0 0 1rem 0;
            font-size: 2.5rem;
            line-height: 1.2;
        }
        .story-meta {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        .story-image {
            margin: 2rem 0;
        }
        .story-image img {
            width: 100%;
            height: auto;
            border-radius: 4px;
        }
        .story-content {
            font-size: 1.2rem;
            line-height: 1.8;
            white-space: pre-wrap;
        }
        .share-buttons {
            margin-top: 2rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .share-buttons a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            color: white;
            text-decoration: none;
            font-size: 0.9rem;
            transition: opacity 0.2s;
        }
        .share-buttons a:hover {
            opacity: 0.9;
        }
        .share-buttons .twitter {
            background-color: #1DA1F2;
        }
        .share-buttons .facebook {
            background-color: #4267B2;
        }
        .share-buttons .linkedin {
            background-color: #0077B5;
        }
        .share-buttons .email {
            background-color: #666;
        }
        .related-stories {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #eee;
        }
        .related-stories h3 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #333;
        }
        .related-story {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #eee;
        }
        .related-story:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .related-story h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }
        .related-story h4 a {
            color: #333;
            text-decoration: none;
        }
        .related-story h4 a:hover {
            color: #666;
        }
        .related-story .meta {
            font-size: 0.9rem;
            color: #666;
        }
        .back-link {
            display: inline-block;
            margin: 2rem 0;
            color: #333;
            text-decoration: none;
        }
        .back-link:hover {
            color: #666;
        }
        @media (max-width: 450px) {
            .story h2 {
                font-size: 1.8rem;
            }
            .story-content {
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    ${HEADER_HTML}
    <div class="container">
        <a href="/" class="back-link" id="back-link">← Back to all stories</a>
        <div id="story"></div>
    </div>
    ${FOOTER_HTML}

    <script>
        ${SHARED_SCRIPTS}
        function formatDate(daysAgo) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return date.toLocaleDateString();
        }

        function snippet(text, length = 200) {
            if (!text) return '';
            return text.length > length ? text.slice(0, length) + '…' : text;
        }

        async function loadStory() {
            const pathParts = window.location.pathname.split('/');
            const storyId = pathParts[pathParts.length - 1];
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');

            // Update back link based on category
            const backLink = document.getElementById('back-link');
            if (category) {
                backLink.href = '/?category=' + encodeURIComponent(category);
                backLink.textContent = '← Back to ' + category;
            } else {
                backLink.href = '/';
                backLink.textContent = '← Back to all stories';
            }

            try {
                const response = await fetch('/api/stories/' + storyId);
                if (!response.ok) {
                    throw new Error('Story not found');
                }

                const story = await response.json();

                // Update page title and meta tags
                document.title = story.title + ' - SLOP News 24/7';
                document.querySelector('meta[name="description"]').setAttribute('content', snippet(story.content, 160));
                document.querySelector('meta[property="og:title"]').setAttribute('content', story.title);
                document.querySelector('meta[property="og:description"]').setAttribute('content', snippet(story.content, 160));
                if (story.image) {
                    document.querySelector('meta[property="og:image"]').setAttribute('content', story.image);
                }

                // Update structured data
                const articleSchema = {
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": story.title,
                    "image": story.image || "",
                    "datePublished": new Date(Date.now() - (story.days_ago * 24 * 60 * 60 * 1000)).toISOString(),
                    "dateModified": new Date(Date.now() - (story.days_ago * 24 * 60 * 60 * 1000)).toISOString(),
                    "author": {
                        "@type": "Organization",
                        "name": story.source
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "SLOP News 24/7",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://slop247.com/logo.png"
                        }
                    },
                    "description": snippet(story.content, 160),
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": window.location.href
                    }
                };

                // Add article schema
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.text = JSON.stringify(articleSchema);
                document.head.appendChild(script);

                const storyHtml =
                    '<article class="story">' +
                        '<div class="story-header">' +
                            '<span class="category">' + story.category + '</span>' +
                            '<h2>' + story.title + '</h2>' +
                            '<div class="story-meta">' +
                                '<span class="source">' + story.source + '</span>' +
                                ' • ' +
                                '<span class="date">' + formatDate(story.days_ago) + '</span>' +
                            '</div>' +
                        '</div>' +
                        (story.image ? '<div class="story-image"><img src="' + story.image + '?width=800&fit=contain" alt="' + story.title + '"></div>' : '') +
                        '<div class="story-content">' + parseMarkdown(story.content) + '</div>' +
                        '<div class="share-buttons">' +
                            '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(story.title) + '&url=' + encodeURIComponent(window.location.href) + '" target="_blank" rel="noopener noreferrer" class="twitter">Twitter</a>' +
                            '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href) + '" target="_blank" rel="noopener noreferrer" class="facebook">Facebook</a>' +
                            '<a href="https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(story.title) + '" target="_blank" rel="noopener noreferrer" class="linkedin">LinkedIn</a>' +
                            '<a href="mailto:?subject=' + encodeURIComponent(story.title) + '&body=' + encodeURIComponent('Check out this article: ' + window.location.href) + '" class="email">Email</a>' +
                        '</div>' +
                    '</article>' +
                    '<div class="related-stories">' +
                        '<h3>Related Stories</h3>' +
                        '<div id="related-stories-list"></div>' +
                    '</div>';

                document.getElementById('story').innerHTML = storyHtml;

                // Load related stories
                try {
                    const relatedResponse = await fetch('/api/stories/' + storyId + '/related');
                    if (relatedResponse.ok) {
                        const relatedStories = await relatedResponse.json();
                        const relatedHtml = relatedStories.map(related =>
                            '<div class="related-story">' +
                                '<h4><a href="/story/' + related.id + '">' + related.title + '</a></h4>' +
                                '<div class="meta">' +
                                    '<span class="source">' + related.source + '</span>' +
                                    ' • ' +
                                    '<span class="date">' + formatDate(related.days_ago) + '</span>' +
                                '</div>' +
                            '</div>'
                        ).join('');
                        document.getElementById('related-stories-list').innerHTML = relatedHtml;
                    }
                } catch (error) {
                    console.error('Error loading related stories:', error);
                }
            } catch (error) {
                console.error('Error loading story:', error);
                document.getElementById('story').innerHTML = '<p>Error loading story. Please try again later.</p>';
            }
        }

        // Load story, render navigation, and update headlines when the page loads
        window.addEventListener('load', () => {
            console.log('Page loaded, initializing...');
            loadStory();
            renderNavigation();
            updateHeadlinesMarquee();
        });
    </script>
</body>
</html>`;
