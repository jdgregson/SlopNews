# SLOP News 24/7

Your trusted source for news and analysis to get you through the hour.

## What is it?

SLOP News 24/7 is an imaginary news organization set in a dystopian near future. The website shares AI generated news articles that are generated hourly based on real world headlines.

## Where is it?

Website: [slop247.com](https://slop247.com)

API: [slop247.com/api/stories](https://slop247.com/api/stories)

## Why is it?

I wanted to explore what happens if you connect a current generation AI assistant to dystopian news and data sources. Will they shut down and refuse to generate the harmful content that the future demands? Or will they self-jailbreak to remain helpful?

## Architecture

### Agents and workers

**Curator Agent** - `curator-agent.slop247.com`
- Fetches real headlines and selects one to generate a story about
- Params: `?key=<AGENT_ACCESS_KEY>` (bypassed for cron triggers)
- Scheduled: Runs hourly at :50 via cron
- Calls: News Agent

**News Agent** - `news-agent.slop247.com`
- Generates complete news stories with images
- Params: `?key=<AGENT_ACCESS_KEY>&headline=<optional_headline>`
- Calls: Image Agent

**Image Agent** - `image-agent.slop247.com`
- Generates images for existing stories
- Params: `?key=<AGENT_ACCESS_KEY>&id=<story_id>`
- Used by: News Agent, manual regeneration

**Website** - `slop247.com`
- Serves the public website and API
- No authentication required

### Secrets

Each agent uses `AGENT_ACCESS_KEY` for its own authentication. Agents calling other agents use `<AGENT_NAME>_ACCESS_KEY`.

## Dev notes

### Build and deploy all packages
```bash
for pkg in `ls -1 | grep "slopnews-" | grep -v prompts`;do cd $pkg;npx prettier --write "src/**/*.ts";npx wrangler deploy;done
```
