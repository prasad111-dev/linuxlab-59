const Category = require('../models/Category');
const { requireAdmin } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = async function categoryRoutes(app) {
  app.get('/', async (req, reply) => {
    reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    const cats = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    return cats.map((c) => ({ ...c, id: c._id.toString() }));
  });

  app.post('/', { preHandler: [requireAdmin] }, async (req) => {
    const { name, slug, description, icon, color, order } = req.body || {};
    if (!name || !String(name).trim()) throw new HttpError(400, 'name is required');
    const cat = await Category.create({
      name: String(name).trim(),
      slug: slug ? slugify(slug) : slugify(name),
      description: description || '',
      icon: icon || '📘',
      color: color || '#6366f1',
      order: Number(order) || 0,
    });
    return { ...cat.toObject(), id: cat._id.toString() };
  });

  app.put('/:id', { preHandler: [requireAdmin] }, async (req) => {
    const cat = await Category.findById(req.params.id);
    if (!cat) throw new HttpError(404, 'Category not found');
    const { name, slug, description, icon, color, order, isActive } = req.body || {};
    if (name) cat.name = String(name).trim();
    if (slug) cat.slug = slugify(slug);
    if (description !== undefined) cat.description = description;
    if (icon !== undefined) cat.icon = icon;
    if (color !== undefined) cat.color = color;
    if (order !== undefined) cat.order = Number(order);
    if (isActive !== undefined) cat.isActive = Boolean(isActive);
    await cat.save();
    return { ...cat.toObject(), id: cat._id.toString() };
  });

  app.delete('/:id', { preHandler: [requireAdmin] }, async (req) => {
    const cat = await Category.findById(req.params.id);
    if (!cat) throw new HttpError(404, 'Category not found');
    await cat.deleteOne();
    return { ok: true };
  });
};
