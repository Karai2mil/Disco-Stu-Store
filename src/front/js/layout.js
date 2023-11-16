// General importations
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext";

import { PrivateRoutes } from "./store/PrivateRoutes.jsx";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Pages
import Home from "./pages/Home.jsx";
import { Single } from "./pages/single";
import { Signup } from "./pages/Signup.jsx";
import { Login } from "./pages/Login.jsx";
import { UserProfile } from "./pages/UserProfile.jsx";
import { UserProfileEdit } from "./pages/UserProfileEdit.jsx"
import { UserSellerDataEdit } from "./pages/UserSellerDataEdit.jsx"
import { ChangePassword } from "./pages/passChange.jsx";
import { AdminPanel } from "./pages/AdminPanel.jsx";
import { AdminInbox } from "./pages/AdminInbox.jsx"
import { AdminArchivedMessages } from './pages/AdminArchivedMessages.jsx'
import { Contact } from "./pages/Contact.jsx"
import About from "./pages/About.jsx";
import { UserOrders } from "./pages/UserOrders.jsx";
import UserInbox from "./pages/UserInbox.jsx";
import UserSentMessages from "./pages/UserSentMessages.jsx";
import { UserFavorites } from "./pages/userFavorites.jsx";
import Cart from './pages/Cart.jsx'
import { UserDeletedMessages } from "./pages/UserDeletedMessages.jsx";
import { UserComposeMessage } from "./pages/UserComposeMessage.jsx";
import { UserViewMessage } from "./pages/UserViewMessage.jsx";
import { UserViewOrderMessage } from "./pages/UserViewOrderMessage.jsx";
import Explorer from './pages/Explorer.jsx'
import Article from "./pages/Article.jsx";
import ArticleDetails from "./pages/ArticleDetails.jsx";
import SellArticle from './pages/SellArticle.jsx'
import Offers from './pages/Offers.jsx'
import InitializeAsSeller from "./pages/InitializeAsSeller.jsx";
import { ArticleReview } from "./pages/AdminReviewArticle.jsx";
import EditHome from "./pages/EditHome.jsx";
import ForgotPassword from "./pages/forgotPassword.jsx";
import EditArticleVideos from "./pages/EditArticleVideos.jsx";
import AdminReviewVideoUpdate from "./pages/AdminReviewVideoUpdate.jsx";
import { AdminReportedComments } from "./pages/AdminReportedComments.jsx";
//Components
import { Artist } from "./pages/artist";
import { BackendURL } from "./component/backendURL";
import ScrollToTop from "./component/scrollToTop";
import { Navbar } from "./component/navbar";

import { Footer } from "./component/footer";
import { GalleryTemplate } from "./pages/gallery_template";
import { AdminApprovals } from "./pages/AdminApprovals.jsx";


//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    const initialOptions = {
        clientId: "",
        currency: "USD",
        intent: "capture",
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <PayPalScriptProvider option={initialOptions}>
                        <div style={{ flex: '1', height: '100%' }}>
                            <Routes>
                                <Route element={<Home />} path="/" />
                                <Route element={<Signup />} path="/signup" />
                                <Route element={<Login />} path="/login" />
                                <Route element={<PrivateRoutes />}>
                                    <Route element={<AdminPanel />} path="/admin-panel" />
                                    <Route element={<AdminInbox />} path="/admin-inbox" />
                                    <Route element={<AdminReportedComments />} path="/admin/reported/comments" />
                                    <Route element ={<AdminReviewVideoUpdate />} path="/videos/update/review/:id" />
                                    <Route element={<AdminArchivedMessages />} path="/admin-archived-messages" />
                                    <Route element={<AdminApprovals />} path="/approvals" />
                                    <Route element={<ArticleReview />} path="/article-review/:id" />
                                    <Route element={<EditHome />} path="/home-edition" />
                                    <Route element={<UserProfile />} path="/user-profile" />
                                    <Route element={<UserProfileEdit />} path="/edit-user" />
                                    <Route element={<UserSellerDataEdit />} path="/seller" />
                                    <Route element={<UserFavorites />} path="/favorites" />
                                    <Route element={<ChangePassword />} path="/update-password" />
                                    <Route element={<UserOrders />} path="/user-orders" />
                                    <Route element={<UserInbox />} path="/messages" />
                                    <Route element={<UserSentMessages />} path="/messages/sent" />
                                    <Route element={<UserDeletedMessages />} path="/messages/trash" />
                                    <Route element={<UserComposeMessage />} path="/messages/compose" />
                                    <Route element={<UserViewMessage />} path="/messages/message" />
                                    <Route element={<UserViewOrderMessage />} path="/messages/message/order" />
                                    <Route element={<Article mode='edit' />} path="/articles/edit/:id" />
                                    <Route element={<Article />} path="/articles/add" />
                                    <Route element={<InitializeAsSeller />} path='/sellers' />
                                    <Route element ={<EditArticleVideos />} path="/videos/update/:id" />
                                </Route>
                                <Route element={<ForgotPassword />} path="/forgot-password" />
                                <Route element={<About />} path="/about" />
                                <Route element={<Contact />} path="/contact" />
                                <Route element={<Artist />} path="/artists" />
                                <Route element={<GalleryTemplate />} path="/gallery_template" />
                                <Route element={<ArticleDetails />} path="/article/:id" />
                                <Route element={<Explorer />} path='/explorer' />
                                <Route element={<Single />} path="/single/:theid" />
                                <Route element={<SellArticle />} path="/sell/:id" />
                                <Route element={<Offers />} path="/offers/:id" />
                                <Route element={<Cart />} path="/cart" />
                                <Route element={<h1>Not found!</h1>} />
                            </Routes>
                        </div>
                    </PayPalScriptProvider>
                    <div>
                        <Footer />
                    </div>
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
