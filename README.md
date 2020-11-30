# cerebro
> A novel recruiting tool using GitHub events.

Finding capable developers is challenging. This tool starts with
a simple heuristic - the ability to get a pull request (PR)
merged given a sufficient amount of feedback, and filters from
there.

The flow is currently as follows:
1. Listen to the public GitHub events firehose for pull request
_merge_ events on PRs that have a specified number of comments.
2. Discard PRs made by bot users
3. For each PR:
  1. Check if the language is your target language
  2. Check if the author of the PR is looking for a job


## Table of Contents

- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Future Work](#future-work)
- [Maintainers](#maintainers)
- [License](#license)

### Prerequisites

You need, or may need:

- [Node.js](https://nodejs.org). The [nvm](https://nvm.sh) tool
  works well for this.
- Optional, but highly recommended: A [GH personal token] with
  default permissions
- Optional: [Docker] and [Docker Compose].

[GH personal token]: https://github.com/settings/tokens
[Docker]: https://docker.io
[Docker Compose]: https://docs.docker.com/compose/

## Usage

**Cerebro** can be run in a number of different ways, always
configured by environment variables.

### Using npx

You can skip the whole installation process altogether and just
run **cerebro** using `npx`

```bash
GH_TOKEN=[insert GH token here] \
LANGUAGES=Solidity,Rust \
npx cerebro-cli
```

### Using Docker and Docker Compose

With `docker`:

```bash
# TODO
```

Or in your `docker-compose` file:

```yaml
# TODO
```

## Configuration

The following environment variables are available:

- `GH_TOKEN`: Your GitHub personal authentication token.
- `LANGUAGES`: Comma separated list of the target languages you're looking for

## Contributing

Issues and PRs accepted. More info coming soon.

### Installing from Source

```
git clone https://github.com/aphelionz/cerebro
cd cerebro
npm install
```

Then run npm start with the aforementioned environment variables
to run, test, and develop!

### Why doesn't this use GraphQL?

GitHub API v4 does not support listening to the public event timeline.

### Future Work

1. Better bot detection
    1. Bot detection really happens in two places, here and in the use of `review_comments`
2. English proficiency
    1. really needs a manual overview until we find / create a good enough tool for this
    2. ideally would be any language
3. Looking for a job false negatives
    1. hireable is either null (false) or true. However null is the default because GH jobs is
    opt-in. So we only make a note of this for now.
4. API rate limiting handling
    1. So far the script just runs every 2 seconds, which is "fine." It could be smarter
5. IPFS + OrbitDB integration?
6. Readline and raw stdin integration to make a proper UI (or just make an API + website)

## Maintainers

[@aphelionz](https://github.com/aphelionz)

## License

AGPL © 2020 Mark Henderson
