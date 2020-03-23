# Usage


## Generic Model


## REST API

Endpoints:

```
/posts
  GET - Query all or a subset of authors.

/posts/:id
  GET - Get the metadata for a single post.
  PUT - Update data for a single post.
  DELETE - Delete a specific post.

/posts/:id/author
  GET - Get metadata for the author of a post.
  POST - Update post author.
  DELETE - Unlink post author.

/posts/:id/archive
  POST - Archive a post.

/posts/:id/comments
  GET - Get the all comments for a single post.
  POST - Add new comment to post comments.

/posts/:id/editors
  GET - Get the all editors for a single post.
  POST - Add new editors to post.
```

Model:

```javascript
class Editor extends RestModel { ... }

class Author extends RestModel { ... }

class Comment extends RestModel {
  ...

  props() {
    ...

    post_id: {
      type: Number,
      required: true,
      fk: Post,
    }
  }

  ...
}

class Post extends RestModel {

  options() {
    return {
      baseURL: '/api',
    }
  }

  meta() {
    return {
      collection: '/posts',
      model: '/posts/:id',
      actions: {
        archive: '/posts/:id/archive',
        refresh: true,
      }
    };
  }

  props() {
    return {      
      slug: {
        parse: value => value.toLowerCase().replace(' ', '-'),
        from: 'title',
        to: false,
      },
      title: {
        default: 'My Post Title',
        required: true,
        type: String,
      },
      body: {
        type: String,
        mutate: value => `<div>${value}</div>`,
      },
      archived: {
        type: Boolean,
        default: false,
      },
      author_id: {
        type: Number,
        required: true,
        fk: Author,
      }
    };
  }

  relations() {
    return {
      author: {
        model: Author,
        url: '/posts/:id/author',
      },
      comments: {
        model: Comment,
        url: '/posts/:id/comments',
      }
      editors: {
        model: Editor,
        url: '/posts/:id/editors',
      }
    };
  }

}
```

Usage:

```javascript
// query
await Post.fetch()
const post = Post.query().filter(post => post.archived && post.body.match(/test/)).one();
const comments = await post.comments.fetch();
const author = await post.author.fetch();

// crud
post.title
post.$.title
post.title = 'test';
await post.commit(); // PUT /posts/:id { title: test }
const newPost = new Post({ title: 'foo' });
await newPost.commit(); // POST /posts { title: foo }
await newPost.remove(); // DELETE /posts/:id

// relations
post.comments.push(new Comment({ ... }));
await post.commit();
post.author = await Author.query().one();
await post.commit();
post.roles.push(await Role.query().random());
await post.commit();
```

Adapter:

```javascript
import 'store' from './store';

class RestAdapter extends Adapter {

  connect(model) {
    // get session token?
  }

  async fetch(cls, params) {
    const name = model.__spec__.name;
    const endpoint = model.__spec__.meta.fetch;
    const results = await axios.get(endpoint, { params }).then(response => response.data);
    store.commit(`${name}.sync`, results);
  }

  async create(cls, data) {
    const name = model.__spec__.name;
    const endpoint = model.__spec__.meta.create;
    const results =  await axios.post(endpoint, data).then(response => response.data);
    store.commit(`${name}.sync`, results);
  }

  async update(instance, data) {
    const name = model.__spec__.name;
    const endpoint = _.template(instance.constructor.__spec__.meta.update)(data);    
    const results =  await axios.put(endpoint, data).then(response => response.data);
    store.commit(`${name}.sync`, results);
  }

  async delete(instance, data) {
    const name = model.__spec__.name;
    const endpoint = _.template(instance.constructor.__spec__.meta.update)(data);
    const results =  await axios.delete(endpoint).then(response => response.data);
    store.commit(`${name}.remove`, data);
  }

  async fetchRelation() {
    ...
  }

}
```

## SQL

Schema:

```
CREATE TABLE authors ( ... )

CREATE TABLE comments (
  ...
  post_id INTEGER REFERENCES posts(id)
)

CREATE TABLE editors(
  ...
  author_editor_id INTEGER REFERENCES author_editor(id)
)

CREATE TABLE post_editor(
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id)
  editor_id INTEGER REFERENCES editors(id)
)

CREATE TABLE posts(
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  body TEXT,
  archived BOOLEAN,
  author_id INTEGER REFERENCES authors(id)
  post_editor_id INTEGER REFERENCES post_editor(id)
)
```

Model:

```javascript
class Editor extends SqlModel { ... }

class Author extends SqlModel { ... }

class Comment extends SqlModel {
  ...

  props() {
    ...

    post_id: {
      type: Number,
      required: true,
      fk: Post,
    }
  }

  ...
}

class PostEditor extends SqlModel {
  meta() {
    return {
      table: 'author_editor',
    }
  }

  props() {
    return {
      post_id: {
        type: Number,
        required: true,
        fk: Post,
      },
      editor_id: {
        type: Number,
        required: true,
        fk: Editor,
      }
    }
  }
}

class Post extends SqlModel {

  options() {
    return {
      host: 'my.db.com',
      username: 'user',
      password: 'password',
      key: 'id',
    };
  }

  meta() {
    return {
      table: 'posts',
    };
  }

  props() {
    return {
      slug: {
        parse: value => value.toLowerCase().replace(' ', '-'),
        from: 'title',
        to: false,
      },
      title: {
        default: 'My Post Title',
        required: true,
        type: String,
      },
      body: {
        type: String,
        mutate: value => `<div>${value}</div>`,
      },
      archived: {
        type: Boolean,
        default: false,
      }
      author_id: {
        type: Number,
        required: true,
        fk: Author,
      }
    };
  }

  relations() {
    return {
      author: {
        model: Author,
      },
      comments: {
        model: Comment,
      },
      roles: {
        model: Role,
        by: AuthorRole,
      }
    };
  }

  async archive() {
    this.archived = true;
    await this.commit();
  }
}
```

Usage:

```javascript
// query
const post = await Post.query().filter(and(equal('archived', true), contains(body, 'test'))).one();
const comments = await post.comments.fetch();
const author = await post.author.fetch();

// crud
post.title
post.title = 'test';
await post.commit(); // UPDATE posts SET title = 'test' WHERE posts.id = :id
const newPost = new Post({ title: 'foo' });
await newPost.commit(); // INSERT into posts(title) VALUES ('test')
await newPost.remove(); // DELETE from posts WHERE posts.id = :id

// relations
post.comments.push(new Comment({ ... }));
await post.commit();
post.author = await Author.query().one();
await post.commit();
post.roles.push(await Role.query().random());
await post.commit();
```

Adapter:

```javascript
import knex from 'knex';

async function transactional(func) {
  return (...arg) => {
    const trx = await knex.transaction();
    try {
      const query = await func(...arg);
      return await trx.commit(query.transacting(trx));
    catch (err) {
      trx.rollback(err);
    }
  }
}

class SqlAdapter extends Adapter {

  connect(model) {
    knex.connect(...);
  }

  reduce(data, model) {
    if (_.isArray(data)) {
      return data.map(item => new model(item));
    } else {
      return new model(item);
    }
  }

  async fetch(model, params) {
    const table = model.__spec__.meta.table;
    return await knex(data).where(params).select('*');
  }

  @transactional
  async create(model, data) {
    const table = model.__spec__.meta.table;
    return await knex(table).insert(data);
  }

  @transactional
  async update(instance, data) {
    const table = instance.constructor.__spec__.meta.table;
    return await knex.update(data).where().into(name);
  }

  @transactional
  async delete(instance, { id }) {
    const table = instance.constructor.__spec__.meta.table;
    return await knex(table).where({ id }).del();
  }

  // const type = relationshipType(modelTable, relationTable);
  async fetchRelation(model, relation, type, params) {
    const modelTable = model.__spec__.meta.table;
    const relationTable = relation.__spec__.meta.table;
    if ( type === 'one-many' ) {
      // comment
      return await knex(table).join(relationTable, {
        `${relationTable}.post_id`: `${modelTable}.id`
      });
    } else ( type === 'many-one' ) {
      // author

    } else ( type === 'many' ) {
      // editors

    }
  }

  async updateRelation() {
    ...
  }

}
```
