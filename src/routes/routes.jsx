const RouteConfig = {
    home: "/",
    category: "/category",
    login : "/login",
    profile:"/profile",
    category_detail: "/category_detail/:id",
    product_detail: "/product_detail/:id",
    cart :"/cart",
    order_process : "/order_process/:type/:id/:quantity",
}

const RouteConfigAdmin = {
    dashboard :"/admin",
    product :"/admin/product",
    category :"/admin/category",
    order :"/admin/order",
    voucher:"/admin/voucher",
    user:"/admin/user",
    message:"/admin/message",
    view_product_detail :"/admin/view_product_detail/:id",
    product_update_page:"/admin/product_update_page/:id",
    product_add_page:"/admin/product_add_page",
    view_order_detail:"/admin/view_order_detail/:id",
    import_new_shipment:"/admin/import_new_shipment/:id",
    view_user_detail:"/admin/view_user_detail/:id"
}
export { RouteConfigAdmin };
export default RouteConfig;