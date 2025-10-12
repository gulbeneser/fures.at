# Fures.at Automation Notes

This repository powers the multilingual AI news blog for **fures.at**. A daily GitHub Action runs `scripts/gemini_daily.py` to fetch fresh AI headlines, generate articles with Google Gemini, and commit the new markdown files back to the repo.

## Where to find the generated blog posts

The automation stores its output inside the [`blog/`](blog) directory. Each supported language has its own subfolder:

- [`blog/tr`](blog/tr) – Turkish posts
- [`blog/en`](blog/en) – English posts
- [`blog/de`](blog/de) – German posts
- [`blog/ru`](blog/ru) – Russian posts

Every run creates a new markdown file named with the timestamp and language code. The timestamp includes the day and minute so t
hat multiple runs in the same day never overwrite previous posts. For example:

```
blog/en/2025-10-12-1630-en-ai-news.md
```

Each file includes front‑matter that the site can use for titles, publish dates, and the language tag. You can open these markdown files directly on GitHub or clone the repository and read them locally with any markdown viewer.

## Previewing the site locally

If you want to verify the content in the development build:

1. Install dependencies once: `npm install`
2. Start the Vite dev server: `npm run dev`
3. Visit `http://localhost:5173` and navigate to the blog section that reads from the generated markdown files.

## Triggering the automation manually

The workflow `build-and-publish` executes `scripts/gemini_daily.py`. You can run the same script locally after exporting a valid `GEMINI_API_KEY`:

```bash
export GEMINI_API_KEY="your-api-key"
python scripts/gemini_daily.py
```

The script generates multilingual posts using the latest RSS feeds, saves them to the `blog/` directory, and commits the results if there are changes.

