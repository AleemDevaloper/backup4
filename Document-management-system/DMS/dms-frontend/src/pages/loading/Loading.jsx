import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Pages/loading.scss";
import logo from "../../assets/images/main-logo.png";
function Loding() {
  return (
    <div>
      <div id="enter">
        <div className="container my-5">
          <div className="d-flex justify-content-center align-items-center flex-column">
             <img src={logo} alt="logo" className="w-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loding;