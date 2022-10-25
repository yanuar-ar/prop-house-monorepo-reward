const nameToSlug = name => name.replaceAll(' ', '-').toLowerCase();

const slugToName = slug => slug.replaceAll('-', ' ');

module.exports = {
  nameToSlug,
  slugToName,
};
