function BlogCard(id, category, headline, author, date, headerImage, description) {
    this.category = category || null;
    this.headline  = headline  || null;
    this.author = author || null;
    this.date = date || null;
    this.headerImage = headerImage;
    this.description = description;
    this.id = id;
}

BlogCard.prototype.getId = function() {
    return this.id;
}

BlogCard.prototype.setId = function(id) {
    this.id = id;
}

BlogCard.prototype.getCategory = function() {
    return this.category;
}

BlogCard.prototype.setCategory = function(category) {
    this.category = category;
}

BlogCard.prototype.getHeadline = function() {
    return this.headline;
}

BlogCard.prototype.setHeadline = function(headline) {
    this.headline = headline;
}

BlogCard.prototype.getAuthor = function() {
    return this.author;
}

BlogCard.prototype.setAuthor = function(author) {
    this.author = author;
}

BlogCard.prototype.getDate = function() {
    return this.date;
}

BlogCard.prototype.setDate = function(date) {
    this.date = date;
}

BlogCard.prototype.getHeaderImage = function() {
    return this.headerImage;
}

BlogCard.prototype.setHeaderImage = function(headerImage) {
    this.headerImage = headerImage;
}

BlogCard.prototype.getDescription = function() {
    return this.description;
}

BlogCard.prototype.setDescription = function(description) {
    this.description = description;
}

module.exports = BlogCard;