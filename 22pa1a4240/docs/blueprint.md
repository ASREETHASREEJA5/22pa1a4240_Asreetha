# **App Name**: AffordLink

## Core Features:

- Concurrent URL Shortening: Allows the user to shorten up to 5 URLs concurrently, specifying the original URL, an optional validity period, and an optional preferred shortcode.
- Client-Side Validation: Validates the user's input for a URL prior to making the API call. Checks the URL format and confirms the validity period is an integer.
- Display Shortened Links: Upon successful creation of shortened URLs, displays each shortened link with its respective expiry date.
- Display All Shortened URLs: Displays a list of all shortened URLs created with their creation and expiry datetimes.
- Display Statistics: For each shortened URL, presents the total number of times the short link has been clicked and displays detailed click data, including the timestamp of each click and the source from which the click originated.
- AI Suggested Shortcode: Suggests an unused shortcode via generative AI. LLM tool takes original url as an input, uses reasoning to ensure suggested short code is an unused and appropriate replacement (non-offensive).
- Set Default Validity: Default the validity period for a shortened URL to 30 minutes, if the user does not specify it.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to reflect technology and innovation.
- Background color: Light gray (#F0F0F0) for a clean and modern look.
- Accent color: A saturated violet (#9C27B0) for emphasis and call-to-action buttons.
- Body font: 'Inter', a grotesque-style sans-serif with a modern look, suitable for headlines or body text.
- Headline font: 'Space Grotesk' is recommended for its computerized feel
- Material UI icons for a consistent and modern look.
- Clean and modern layout with a focus on key elements and user experience. Adhere to Material UI standards.