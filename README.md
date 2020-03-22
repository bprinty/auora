
[![Build Status](https://travis-ci.com/bprinty/auora.png?branch=master)](https://travis-ci.com/bprinty/auora) [![Code coverage](https://codecov.io/gh/bprinty/Flask-Occam/branch/master/graph/badge.svg)](https://codecov.io/gh/bprinty/Flask-Occam) [![Maintenance yes](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/bprinty/auora/graphs/commit-activity) [![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/bprinty/auora/blob/master/LICENSE) [![Documentation status](http://inch-ci.org/github/dwyl/hapi-auth-jwt2.svg?branch=master)](https://bprinty.github.io/auora)

# auora


## Overview

This is a starter template for a general javascript project.


## Installation

### Install in Project

To use this library in a Vue project, add the package to your package dependencies via:

```bash
npm install --save auora
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add auora
```


### Use via CDN

To use this package via CDN, import it in your project via:

```html
<script src="https://unpkg.com/auora/dist/index.min.js"></script>
```


## Documentation

Documentation for the project can be found [here](http://bprinty.github.io/auora).


## Overview

For full documentation on how to use the plugin, see the (docs)[https://bprinty.github.io/auora]. The sections below will give a brief overview of some of the concepts.

### Setup

To use this package in a webpage, include the following script tag in your application:

```html
<script src="index.min.js"></script>
```

Or, if you're using this in a javascript project directly, you can import or require the module like so:

```js
var pkg = require('auora')
// or
import { add } from 'auora'
```

### Adding Numbers

Basic usage examples for package:

```js
pkg.add(1, 2)
```

## Contributors

### Getting Started

To get started contributing to the project, simply clone the repo and setup the dependencies using `yarn` or `npm install`:

```bash
git clone git@github.com:bprinty/auora.git
cd auora/
yarn
```

Once you do that, you should be ready to write code, run tests, and edit the documentation.


### Building Documentation

To develop documentation for the project, make sure you have all of the developer dependencies installed from the `package.json` file in the repo. Once you have all of those dependencies, you can work on the documentation locally using:

```bash
yarn docs:dev
```

Or, using `vuepress` directly:

```bash
vuepress dev docs
```

### Running Tests

The [Jest](https://jestjs.io/) framework is used for testing this application. To run tests for the project, use:

```bash
yarn test
```

To have Jest automatically watch for changes to code for re-running tests in an interactive way, use:

```bash
yarn test:watch
```

To run or watch a specific test during development, use:

```bash
yarn test:watch -t model.update
```

Or, you can invoke `jest` directly:

```bash
jest
jest --watch
jest --watch -t model.update
```

### Submiting Feature Requests

If you would like to see or build a new feature for the project, submit an issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora/issues) for the project. When submitting a feature request, please fully explain the context, purpose, and potential implementation for the feature, and label the ticket with the `discussion` label. Once the feature is approved, it will be re-labelled as `feature` and added to the project Roadmap.


### Improving Documentation

Project documentation can always be improved. If you see typos, inconsistencies, or confusing wording in the documentation, please create an issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora/issues) with the label `documentation`. If you would like to fix the issue or improve the documentation, create a branch with the issue number (i.e. `GH-123`) and submit a PR against the `master` branch.


### Submitting PRs

For contributors to this project, please submit improvements according to the following guidelines:

1. Create a branch named after the ticket you're addressing. `GH-1` or `bp/GH-1` are examples of good branch naming.
2. Make your changes and write tests for your changes.
3. Run all tests locally before pushing code.
4. Address any test failures caught by [Travis CI](https://travis-ci.com/bprinty/auora).
5. Make sure you've updated the documentation to reflect your changes (if applicable).
6. Submit a PR against the `master` branch for the project. Provide any additional context in the PR description or comments.


### Keeping up to Speed on the Project

All development efforts for the project are tracked by the project [Kanban](https://github.com/bprinty/auora/projects/1) board. Contributors use that board to communicate the status of pending, in-progress, or resolved development efforts. If you have a question about the Roadmap or current in-progress issues for the project, see that board.
