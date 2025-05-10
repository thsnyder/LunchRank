# LunchRank

A web application for rating and ranking lunch restaurants, built with Next.js and Airtable.

## Features

- Restaurant ratings and reviews
- User profiles with rating history
- Restaurant analytics and statistics
- Restaurant suggestions
- Beautiful, responsive UI with animations

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- DaisyUI
- Framer Motion
- Airtable

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LunchRank.git
cd LunchRank
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Airtable credentials:
```
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for deployment on Vercel. To deploy:

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Vercel](https://vercel.com) and create a new project
3. Import your GitHub repository
4. Add your environment variables in the Vercel project settings
5. Deploy!

## Environment Variables

The following environment variables are required:

- `AIRTABLE_API_KEY`: Your Airtable API key
- `AIRTABLE_BASE_ID`: Your Airtable base ID

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
