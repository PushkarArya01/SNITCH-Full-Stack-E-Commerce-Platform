SNITCH catalog update

Replace:
server/seed/data/products.js
with products.js

Replace:
server/seed/seedProducts.js
with seedProducts.js

Final catalog:
- 7 categories
- 8 products per category
- 56 products total
- exactly 1 image per product
- 56 unique Pexels source images
- seed script validates duplicate image sources before deleting old products

Run from server:
npm run seed:products
