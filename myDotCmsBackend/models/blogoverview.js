function BlogOverview(overview) {
    this.overview = overview || null;
}

BlogOverview.prototype.getOverview = function() {
    return this.overview;
}

BlogOverview.prototype.setOverview = function(overview) {
    this.overview = overview;
}

module.exports = BlogOverview;