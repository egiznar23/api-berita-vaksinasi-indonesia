require('dotenv').config();
const app = require('express')();
const cors = require('cors');
const { endpoints, endpointsOverview } = require('./utils/endpoints');
const feedid = require('feedid');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
  next();
});

endpoints.forEach((endpoint) => {
  app.get(`/${endpoint.primary}/:category`, async (req, res) => {
    const { category } = req.params;

    try {
      const response = await feedid[endpoint.primary][category]();
      
      response.data.posts = selection(response.data.posts);
      response.data.totalResult = response.data.posts.length;
      
      return res.send(response);
    } catch (error) {
      return res
        .status(404)
        .send({ data: null, message: 'Not found', success: false });
    }
  });
});

app.get('/', (req, res) => {
  return res.send({
    about: 'RSS Feed REST API Berita Vaksin Indonesia JSON',
    github: 'https://github.com/egiznar23/api-berita-vaksin-indonesia',
    endpoints: endpointsOverview,
  });
});

app.all('*', (req, res) => {
  return res
    .status(404)
    .send({ data: null, message: 'Not found', success: false });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// function selection news
const selection = function(posts) {
        for(let i = 0; i < posts.length; i++) {
        const title = posts[i].title.toLowerCase(); // change uppercase to lowercase                                   
        if (!title.includes("vaksin")) {
          delete posts[i];
        } 
      }
    return posts.filter(function(x) { return x !== null }); // remove value null
}
