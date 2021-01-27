function BlogPageContent(content) {
    this.content = content || null;
}

BlogPageContent.prototype.getContent = function() {
    return this.content;
}

BlogPageContent.prototype.setContent = function(content) {
    this.content = this.content;
}

module.exports = BlogPageContent;