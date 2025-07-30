// src/layouts/MainLayout.jsx
import NavBar from "./pages/NavBar";
import Footer from "./pages/Footer";

export default function MainLayout({ children }) {
    return (
        <div className="pb-28">
            <NavBar />
            {children}

            <Footer />
        </div>
    );
}
