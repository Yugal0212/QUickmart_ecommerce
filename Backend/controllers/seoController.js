const SeoSettings = require("../models/SeoSettings");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Blog = require("../models/Blog");
const User = require("../models/User");

// SEO Settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SeoSettings.findOne();
    if (!settings) {
      settings = await SeoSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await SeoSettings.findOne();
    if (settings) {
      settings = await SeoSettings.findOneAndUpdate({}, req.body, { new: true });
    } else {
      settings = await SeoSettings.create(req.body);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Sitemap Generator
exports.getSitemap = async (req, res) => {
  try {
    const settings = await SeoSettings.findOne();
    const baseUrl = settings ? settings.canonicalUrl : "https://quickmartnexa.vercel.app";

    const products = await Product.find({ approvalStatus: 'approved' }).select('seo.slug updatedAt').lean();
    const categories = await Category.find().select('seo.slug updatedAt').lean();
    const blogs = await Blog.find().select('slug updatedAt').lean();
    const sellers = await User.find({ roles: 'seller', sellerStatus: 'approved' }).select('sellerDetails.seo.slug updatedAt').lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    const staticPages = ['', '/allproducts', '/become-seller', '/login/sign-in', '/login/sign-up'];
    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    });

    // Dynamic Pages
    products.forEach(p => {
      if(p.seo && p.seo.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/products/${p.seo.slug}</loc>\n    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    });

    categories.forEach(c => {
      if(c.seo && c.seo.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/category/${c.seo.slug}</loc>\n    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    });

    blogs.forEach(b => {
      if(b.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <lastmod>${new Date(b.updatedAt).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    });

    sellers.forEach(s => {
      if(s.sellerDetails && s.sellerDetails.seo && s.sellerDetails.seo.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/seller/${s.sellerDetails.seo.slug}</loc>\n    <lastmod>${new Date(s.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
};

// Robots.txt Generator
exports.getRobotsTxt = async (req, res) => {
  try {
    const settings = await SeoSettings.findOne();
    const baseUrl = settings ? settings.canonicalUrl : "https://quickmartnexa.vercel.app";
    
    let robots = `User-agent: *\nAllow: /\nDisallow: /admin-dashboard/\nDisallow: /sheller-dashboard/\nDisallow: /order/\nDisallow: /cart\n\nSitemap: ${baseUrl}/api/seo/sitemap.xml`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    res.status(500).send("Error generating robots.txt");
  }
};

// SEO Analyzer
exports.analyzeSeo = async (req, res) => {
  try {
    const products = await Product.find({ approvalStatus: 'approved' }).select('seo name').lean();
    const categories = await Category.find().select('seo name').lean();
    
    let totalItems = products.length + categories.length;
    let missingMeta = 0;
    let missingSlugs = 0;

    const warnings = [];

    products.forEach(p => {
      if (!p.seo || !p.seo.title || !p.seo.description) {
        missingMeta++;
        warnings.push(`Product "${p.name}" is missing SEO Meta Title/Description.`);
      }
      if (!p.seo || !p.seo.slug) {
        missingSlugs++;
      }
    });

    categories.forEach(c => {
      if (!c.seo || !c.seo.title || !c.seo.description) {
        missingMeta++;
        warnings.push(`Category "${c.name}" is missing SEO Meta Title/Description.`);
      }
      if (!c.seo || !c.seo.slug) {
        missingSlugs++;
      }
    });

    let score = 100;
    if (totalItems > 0) {
      const penalty = ((missingMeta + missingSlugs) / (totalItems * 2)) * 100;
      score = Math.max(0, Math.round(100 - penalty));
    }

    res.json({
      score,
      indexedPages: totalItems,
      missingMeta,
      missingSlugs,
      warnings: warnings.slice(0, 50) // Return top 50 warnings to prevent massive payloads
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
