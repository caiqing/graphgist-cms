// var tags = {
//   1: {id: 1, name: "tag1"},
//   2: {id: 2, name: "tag2"},
//   3: {id: 3, name: "tag3"},
//   4: {id: 4, name: "tag4"}};

// var categories = {
//   1: {id: 1, name: "Dogs"},
//   2: {id: 2, name: "Cats"},
//   3: {id: 3, name: "Rabbits"},
//   4: {id: 4, name: "Lions"}};

// var gists = {
//   1: {id: 1,
//       category: categories[2],
//       name: "Cat 1",
//       urls: ["url1", "url2"],
//       tags: [tags[1], tags[2]],
//       status: "available"},
//   2: {id: 2,
//       category: categories[2],
//       name: "Cat 2",
//       urls: ["url1", "url2"],
//       tags: [tags[2], tags[3]],
//       status: "available"},
//   3: {id: 3,
//       category: categories[2],
//       name: "Cat 3",
//       urls: ["url1", "url2"],
//       tags: [tags[3], tags[4]],
//       status: "available"},
//   4: {id: 4,
//       category: categories[1],
//       name: "Dog 1",
//       urls: ["url1", "url2"],
//       tags: [tags[1], tags[2]],
//       status: "available"},
//   5: {id: 5,
//       category: categories[1],
//       name: "Dog 2",
//       urls: ["url1", "url2"],
//       tags: [tags[2], tags[3]],
//       status: "available"},
//   6: {id: 6,
//       category: categories[1],
//       name: "Dog 3",
//       urls: ["url1", "url2"],
//       tags: [tags[3], tags[4]],
//       status: "available"},
//   7: {id: 7,
//       category: categories[4],
//       name: "Lion 1",
//       urls: ["url1", "url2"],
//       tags: [tags[1], tags[2]],
//       status: "available"},
//   8: {id: 8,
//       category: categories[4],
//       name: "Lion 2",
//       urls: ["url1", "url2"],
//       tags: [tags[2], tags[3]],
//       status: "available"},
//   9: {id: 9,
//       category: categories[4],
//       name: "Lion 3",
//       urls: ["url1", "url2"],
//       tags: [tags[3], tags[4]],
//       status: "available"},
//   10: {id: 10,
//       category: categories[3],
//       name: "Rabbit 1",
//       urls: ["url1", "url2"],
//       tags: [tags[3], tags[4]],
//       status: "available"}
// };


// exports.getGistById = function getGistById(id) {
//   return gists[id];
// };


// exports.findGistByStatus = function findGistByStatus(status) {
//   var keys = {}
//   var array = status.split(",");
//     array.forEach(function(item) {
//       keys[item] = item;
//     });
//   var output = [];
//   for(var key in gists) {
//     var gist = gists[key];
//     if(gist.status && keys[gist.status]) output.push(gist);
//   }
//   return output;
// };

// exports.findGistByTags = function findGistByTags(tags) {
//   var keys = {};
//   var array = tags.split(",");
//   array.forEach(function(item) {
//     keys[item] = item;
//   });
//   var output = [];
//   for(var key in gists) {
//     var gist = gists[key];
//     if(gist.tags) {
//       gist.tags.forEach(function (tag) {
//         if(tag.name && keys[tag.name]) output.push(gist);
//       });
//     }
//   }
//   return output;
// };

// exports.addGist = function addGist(gist){
//   gists[gist.id] = gist;
// };

// exports.deleteGist = function deleteGist(id) {
//   delete gists[id];
// };