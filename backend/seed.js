const { connectDB } = require('./config/database');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  // Appetizers (8 products)
  { name: 'Chicken Wings', description: 'Crispy fried chicken wings with buffalo sauce', price: 12.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc2090?w=500' },
  { name: 'Mozzarella Sticks', description: 'Golden fried mozzarella cheese sticks with marinara sauce', price: 8.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1541599468348-e96984315621?w=500' },
  { name: 'Nachos', description: 'Tortilla chips topped with cheese, jalapeños, and salsa', price: 10.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
  { name: 'Spring Rolls', description: 'Vegetable spring rolls with sweet chili sauce', price: 7.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500' },
  { name: 'Bruschetta', description: 'Toasted bread topped with tomatoes, basil, and balsamic glaze', price: 9.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=500' },
  { name: 'Calamari Rings', description: 'Fried squid rings with tartar sauce', price: 11.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500' },
  { name: 'Stuffed Mushrooms', description: 'Mushrooms stuffed with cheese and herbs', price: 9.49, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500' },
  { name: 'Onion Rings', description: 'Crispy battered onion rings', price: 6.99, category: 'Appetizers', image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500' },

  // Main Courses (10 products)
  { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon grilled with lemon herb butter', price: 24.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500' },
  { name: 'Ribeye Steak', description: '12oz prime ribeye steak cooked to perfection', price: 32.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500' },
  { name: 'Chicken Parmesan', description: 'Breaded chicken breast with marinara and mozzarella', price: 18.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=500' },
  { name: 'Beef Burger', description: 'Juicy beef patty with lettuce, tomato, and cheese', price: 14.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'Vegetable Stir Fry', description: 'Mixed vegetables stir-fried with tofu and soy sauce', price: 13.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' },
  { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon, eggs, and parmesan', price: 16.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1551892376-c73ba8b2b6ad?w=500' },
  { name: 'Lamb Chops', description: 'Grilled lamb chops with rosemary and garlic', price: 28.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500' },
  { name: 'Shrimp Scampi', description: 'Shrimp in garlic butter sauce over linguine', price: 22.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500' },
  { name: 'Pork Tenderloin', description: 'Herb-crusted pork tenderloin with apple sauce', price: 19.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' },
  { name: 'Fish and Chips', description: 'Beer-battered cod with fries and tartar sauce', price: 15.99, category: 'Main Courses', image_url: 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=500' },

  // Desserts (6 products)
  { name: 'Chocolate Cake', description: 'Rich chocolate cake with fudge frosting', price: 7.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500' },
  { name: 'Cheesecake', description: 'New York style cheesecake with berry compote', price: 6.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500' },
  { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 8.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500' },
  { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with chocolate syrup and nuts', price: 5.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1552714574-190b47c4c96b?w=500' },
  { name: 'Apple Pie', description: 'Warm apple pie with cinnamon and vanilla ice cream', price: 6.49, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500' },
  { name: 'Brownie', description: 'Fudgy chocolate brownie with walnuts', price: 4.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=500' },

  // Beverages (6 products)
  { name: 'Coca Cola', description: 'Classic cola soft drink', price: 2.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500' },
  { name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500' },
  { name: 'Coffee', description: 'Fresh brewed coffee', price: 2.49, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500' },
  { name: 'Iced Tea', description: 'Sweetened iced tea', price: 2.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500' },
  { name: 'Beer', description: 'Local craft beer on tap', price: 5.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500' },
  { name: 'Wine', description: 'House red wine by the glass', price: 7.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500' }
];

const seedProducts = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Seeding products...');

    for (const product of sampleProducts) {
      await Product.create({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        is_available: true
      });
    }

    console.log('Successfully seeded 30 products!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
