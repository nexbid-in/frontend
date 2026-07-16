import { Link } from "react-router-dom";

function LandingPage () {
    return (
        <div>
            <h1>Landing Page</h1>
            <Link to='/about'>About Page</Link>
        </div>
    )
}


export default LandingPage;