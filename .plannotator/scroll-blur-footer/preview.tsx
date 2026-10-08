import { createRoot } from "react-dom/client";
import ScrollBlurFooter from "./scroll-blur-footer";

const image = "https://framerusercontent.com/images/QaPKJVIGqlVdLI4luv7VueVzR0.jpg?scale-down-to=2048&width=5120&height=2880";
const root = document.getElementById("root");
if (!root) throw new Error("Preview root is missing");
createRoot(root).render(
  <>
    {[0, 1].map((index) => (
      <section key={index} style={{ height: "100vh", padding: 10, boxSizing: "border-box" }}>
        <img src={image} alt="Abstract mint, white and black gradient" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, display: "block" }} />
      </section>
    ))}
    <ScrollBlurFooter />
  </>,
);
