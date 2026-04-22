import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import database from "../database/db.js";

export const createProduct = catchAsyncError(async (req, res, next) => {
    const { name, description, price, category, stock } = req.body;
    const created_by = req.user.id;

    if (!name || !description || !price || !category || !stock) {
        return next(new ErrorHandler("Please provide complete product details.", 400));
    }

    let uploadedImages = [];

    if (req.files?.images) {
        const images = Array.isArray(req.files.images)
            ? req.files.images
            : [req.files.images];

        for (const image of images) {
            const result = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: "Ecommerce_Product_Images",
                width: 1000,
                crop: "scale",
            });

            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }
    }

    const product = await database.query(
        `INSERT INTO products (name, description, price, category, stock, images, created_by)
         VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, price/92.68, category, stock, JSON.stringify(uploadedImages), created_by]
    );

    res.status(201).json({
        success: true,
        message: "Product created successfully.",
        product: product.rows[0],
    });
});


export const fetchAllProducts = catchAsyncError(async(req, res, next) =>{
    const {availability, price, category,ratings, search} = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const conditions = [];
    let values = [];
    let index = 1;

    let paginationPlaceholders = {};
      // Filter products by availability
    if(availability === "in-stock"){
        conditions.push(`stock > 5`);
    }else if(availability === "limited"){
        conditions.push(`stock > 0 AND stock <= 5`);
    }else if(availability === "out-of-stock"){
        conditions.push(`stock = 0`);
    }
     // Filter products by price
    if(price){
        const [minPrice, maxPrice] = price.split("-");
        if(minPrice && maxPrice){
            conditions.push(`price Between $${index} AND $${index + 1}`);
            values.push(minPrice, maxPrice);
            index += 2;
        }
    }
    // Filter products by Category
    if (category){
        conditions.push(`category ILIKE $${index}`);
        values.push(`%${category}%`);
        index++;
    }

    // Filter products by rating
    if(ratings){
        conditions.push(`ratings >= $${index}`);
        values.push(ratings);
        index++;
    }
    //Add search query
    if(search){
        conditions.push(`(p.name ILIKE $${index} OR p.description ILIKE $${index} )`);
        values.push(`%${search}%`);
        index++;
    }

    const whereClause = conditions.length? `WHERE ${conditions.join("AND")}`
    : " ";

    //Get count of filterd products
    const totalProductsResult = await database.query(
        `SELECT COUNT(*) FROM products p ${whereClause}`,
        values
    );

    const totalProducts = parseInt (totalProductsResult.rows[0].count);
    paginationPlaceholders.limit = `$${index}`;
    values.push(limit);
    index++;

    paginationPlaceholders.offset = `$${index}`;
    values.push(offset);
    index++;

    //FETCH WITH REVIEWS
    const query =`
    SELECT p.*, 
    COUNT(r.id) AS review_count
    FROM products p 
    LEFT JOIN reviews r ON p.id = r.product_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ${paginationPlaceholders.limit}
    OFFSET ${paginationPlaceholders.offset}
    `;

    const result = await database.query(query, values);

    const newProductsQuery = `
    SELECT p.*, COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 8`;

    const newProductsResult = await database.query(newProductsQuery);
    // QUERY FOR FETCHING TOP RATED PRODUCTS (rating >= 4.5)
    const topRatedQuery = `
    SELECT p.*,
    COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.ratings >= 4.5
    GROUP BY p.id
    ORDER BY p.ratings DESC, p.created_at DESC
    LIMIT 8
    `;

    const topRatedResult = await database.query(topRatedQuery);

    res.status(200).json({
        success: true,
        products: result.rows,
        totalProducts,
        newProducts: newProductsResult.rows,
        topRatedProducts: topRatedResult.rows,
    });
});

export const updateProduct = catchAsyncError(async (req, res, next) =>{
    const { productId } = req.params;
     const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
        return next(new ErrorHandler("Please provide complete product details.", 400));
    }

    const product = await database.query("SELECT * FROM products WHERE id = $1",[
        productId,
    ]);
    if(product.rows.length === 0){
        return next(new ErrorHandler("Product not found.", 404));
    }
    const result = await database.query(
        `UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock = $5 WHERE id = $6
        RETURNING *`,
        [name, description, price / 92, category, stock, productId]
    );
    res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        updatedProduct: result.rows[0],
    });
})

export const deleteProduct = catchAsyncError(async(req, res, next) =>{
    const { productId } = req.params;

    const product = await database.query("SELECT * FROM products WHERE id = $1",[
        productId,
    ]);
    if(product.rows.length === 0){
        return next(new ErrorHandler("Product not found.", 404));
    } 

    const images = product.rows[0].images;

    const deleteResult = await database.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [productId]
    );
      if(deleteResult.rows.length === 0){
        return next (new ErrorHandler("Failed to delete product.", 500));
    }

    // Delete images from cloudinary
    if(images && images.length > 0){
        for(const image of images){
            await cloudinary.uploader.destroy(image.public_id);
        }
    }
    res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
    
    });

});

export const fetchSingleProduct = catchAsyncError(async (req, res, next) => {
     const { productId } = req.params;

     const result = await database.query(
        `
        SELECT p.*,
        COALESCE(
        JSON_agg(
        json_build_object(
           'review_id', r.id,
           'rating', r.rating,
           'comment', r.comment,
           'reviewer', json_build_object(
            'id', u.id,
            'name', u.name,
            'avatar', u.avatar
            )
        )
        ) FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         LEFT JOIN users u ON r.user_id = u.id
         WHERE p.id = $1
         GROUP BY p.id`,
        [productId]
    );

    res.status(200).json({
        success: true, 
        message: "Product fetched successfully",
        product: result.rows[0],
    });
});

export const postProductReview = (async(req, res, next) =>{
    const { productId } = req.params;
    const { rating, comment } = req.body;
    if(!rating || !comment) {
        return next(new ErrorHandler("PLease provide rating and comment.", 400));
    }
    const purchaseCheckQuery = `
    SELECT oi.product_id
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN payments p ON p.order_id = o.id
    WHERE o.buyer_id = $1
    AND oi.product_id = $2
    AND p.payment_status = 'Paid'
    LIMIT 1
    `;


    const {rows} = await database.query(purchaseCheckQuery,[
        req.user.id,
        productId,
    ]);
    if(rows.length === 0){
        return res.json({
            success: false,
            message : "You can only review a product you've purchased.",
        });
    }

    const product = await database.query("SELECT * FROM products WHERE id = $1", [
        productId,
    ]);

    if(product.rows.length === 0){
        
    }
})

