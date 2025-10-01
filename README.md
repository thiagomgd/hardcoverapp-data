# Hardcover.app data check

App to check some data and stats on Hardcover.app.

Very early WIP - commits are not being added directly to master until we get to a `V1` release.

## Setup

### Environment Variables

1. Create a `.env.local` file in the project root
2. Add your Hardcover API token:

```bash
HARDCOVER_TOKEN=your_hardcover_api_token_here
```

To get your Hardcover API token:

1. Go to [hardcover.app](https://hardcover.app)
2. Log in to your account
3. Go to your account settings
4. Generate an API token
5. Copy the token and add it to your `.env.local` file

**Note:** The `.env.local` file is ignored by git and should not be committed to version control.

### Running the Server

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev:server
```

The server will start on `http://localhost:3000`

### API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/owned` - Get all books from your "Owned" list
  - Uses the token from `.env.local` automatically
  - Can also accept a token parameter: `?token=your_token`

## Features

### Checks

- [x] TBR lists check (requires `TBR: ` lists)
  - [x] read books on TBR lists
  - [x] unread books on multiple TBR lists
- [ ] Owned books that have a different version marked as read
- [x] Read boks with no rating or review (option to skip graphic novels/light novels)
- [ ] Books without type (Book, Novella, Light Novel)
- [x] Series status check (requires `Series: ` lists with 1st book in each series)
  - [ ] Series that are not in any list (maybe skip completed series?)
- [ ] Books without page numbers

### Stats And Info

- [ ] Series finished vs incomplete - also take into account read all main books vs all including novellas.
- [ ] % of books read owned vs not
  - [ ] followup - check lists like Library for more data

### Check previously saved info

WIP

### Other

- [ ] Export results fo each feature as markdown.
