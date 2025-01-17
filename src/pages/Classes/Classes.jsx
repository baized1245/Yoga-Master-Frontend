import React, { useEffect, useState } from "react";
import UseAxioxFetch from "../../hooks/UseAxioxFetch";
import { Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { toast } from "react-toastify";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const { currentUser } = useUser();
  // console.log(currentUser.email);
  const role = currentUser?.role;
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const navigate = useNavigate();

  const [hoveredCard, setHoverdCard] = useState(null);
  const axiosFetch = UseAxioxFetch();
  const axiosSecure = useAxiosSecure();

  const handleHover = (index) => {
    setHoverdCard(index);
  };

  useEffect(() => {
    axiosFetch
      .get("/classes")
      .then((res) => setClasses(res.data))
      .catch((err) => console.log(err));
  }, []);

  // handle add to cart
  const handleSelect = (id) => {
    // console.log(id);
    axiosSecure
      .get(`/enrolled-classes/${currentUser?.email}`)
      .then((res) => setEnrolledClasses(res.data))
      .catch((err) => console.log(err));

    if (!currentUser) {
      alert("Please login first");
      return navigate("/login");
    }

    axiosSecure
      .get(`/cart-item/${id}?email${currentUser?.email}`)
      .then((res) => {
        if (res.data.classId === id) {
          return alert("Already selected!");
        } else if (enrolledClasses.find((item) => item.classes._id === id)) {
          return alert("Alert enrolled");
        } else {
          const data = {
            classId: id,
            userMail: currentUser?.email,
            date: new Date(),
          };
          axiosSecure.post("/add-to-cart", data).then((res) => {
            alert("Added to the cart successfully!");
            console.log(res.data);
          });
        }
      });
  };

  return (
    <div>
      <div className="mt-20">
        <h1 className="text-4xl font-bold text-center text-primary">Classes</h1>
      </div>

      <div className="my-16 w-[90%] mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {classes.map((cls, index) => (
          <div
            onMouseLeave={() => handleHover(null)}
            key={index}
            className={`relative hover:-translate-y-2 duration-200 hover:ring-[2px] hover:ring-secondary w-64 mx-auto ${
              cls.availableSeats < 1 ? "bg-red-300" : "bg-white"
            } dark:bg-slate-600 rounded-lg shadow-lg overflow-hidden cursor-pointer`}
            onMouseEnter={() => handleHover(index)}
          >
            <div className="relative h-48">
              <div
                className={`absolute inset-0 bg-black opacity-0 transition-opacity duration-300 ${
                  hoveredCard === index ? "opacity-60" : ""
                }`}
              />
              <img
                src={cls.image}
                alt="Classes"
                className="object-cover w-full h-full"
              />
              <Transition
                show={hoveredCard === index}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="transition duration-300 ease-in data-[closed]:opacity-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => handleSelect(cls._id)}
                      title={
                        role === "admin" || role === "instructor"
                          ? "Instructor/Admin Can not be able to select"
                            ? cls.availableSeats < 1
                            : "No Seat Available"
                          : "You can select classes"
                      }
                      disabled={
                        role === "admin" ||
                        role === "instructor" ||
                        cls.availableSeats < 1
                      }
                      className="px-4 py-2 text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
            {/* details */}
            <div className="px-6 py-2">
              <h3 className="font-semibold mb-1">{cls.name}</h3>
              <p className="text-gray-500 text-xs">
                Instructor: {cls.instructorName}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-600 text-xs">
                  Available Seats: {cls.availableSeats}
                </span>
                <span className="text-green-500 font-semibold">
                  ${cls.price}
                </span>
              </div>
              <Link to={`/class/${cls._id}`}>
                <button className="px-4 py-2 mt-4 mb-2 w-full mx-auto text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700">
                  View
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;
