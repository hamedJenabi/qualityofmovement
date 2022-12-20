import Head from "next/head";
import useMedia from "use-media";
import Router from "next/router";
import { useRouter } from "next/router";
import { CSVLink, CSVDownload } from "react-csv";
import React, { useState } from "react";
import styles from "./Dashboard.module.scss";
import Header from "../../components/Header/Header.js";
import classNames from "classnames";
import { levelsToShow, titleCase, statusList } from "../../utils/functions";
import { unstable_FormCheckbox as FormCheckbox } from "reakit/Form";
import { unstable_useFormState as useFormState } from "reakit/Form";

export default function Dashboard({ users, tickets }) {
  const [nameSearch, setNameSearch] = useState("");
  const [activeSideBar, setActiveSideBar] = useState("all");
  const [capacityShow, setCapacityShow] = useState(false);
  const [userToShow, setUserToShow] = useState(users || []);
  const isMobile = useMedia({ maxWidth: "768px" });
  console.log("helloÄ", users);
  const totalAmount = users.reduce((acc, user) => {
    return (
      acc +
      (user.status !== "canceled" && user.status !== "out"
        ? parseInt(user.price, 10)
        : 0)
    );
  }, 0);
  const totalAmountList = userToShow.reduce((acc, user) => {
    return (
      acc +
      (user.status !== "canceled" && user.status !== "out"
        ? parseInt(user.price, 10)
        : 0)
    );
  }, 0);
  console.log("totalAmount", totalAmount);
  const router = useRouter();

  const form = useFormState({
    values: {
      status: "",
      users: [],
    },

    onSubmit: (values) => {
      setIsClicked(true);
      const req = {
        ...form.values,
      };
    },
  });
  const [status, setStatus] = useState("");
  const [usersToChange, setUsersToChange] = useState([]);

  const handleStatusChange = async () => {
    const idsToChange = form.values.users;
    let array = [];
    idsToChange.map((id) => {
      array.push(users.find((userinfo) => userinfo.id === id));
    });

    array.map((item) => {
      const toEdit = {
        ...item,
        firstname: item.firstname,
        lastname: item.lastname,
        status: status,
      };
      fetch("/api/edituser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
        },
        body: JSON.stringify(toEdit),
      })
        .then((response) => {
          if (response.status === 200) {
            router.reload(window.location.pathname);
          }
          if (response.status === 401) {
            alert("Please write a valid status");
          }
        })
        .catch((error) => console.log(error));
    });
    alert("done");
  };
  const BalanceComponent = () => {
    const getTicketAmount = (role, status) => {
      const registerAmount = users.filter(
        (user) => user["role"] === role && user["status"] === status
      );
      return registerAmount.length;
    };
    const getClassAmount = (role, status) => {
      const registerAmount = users.filter(
        (user) =>
          user["role"] === role &&
          user["status"] === status &&
          user["additional"] === "yes"
      );
      return registerAmount?.length;
    };

    return (
      <div className={styles.balanceComponent}>
        <div className={styles.ticketRow}>
          <div className={styles.ticketAmount}>
            <h4>Follow</h4>
            {statusList.map((status) => (
              <p key={status.value}>
                {status.label}: {getTicketAmount("follow", status.value)} (
                {getClassAmount("follow", status.value)})
              </p>
            ))}
          </div>
          <div className={styles.ticketAmount}>
            <h4>Lead</h4>

            {statusList.map((status) => (
              <p key={status.value}>
                {status.label}: {getTicketAmount("lead", status.value)} (
                {getClassAmount("lead", status.value)})
              </p>
            ))}
          </div>
          <div className={styles.ticketAmount}>
            <h4>Switch</h4>

            {statusList.map((status) => (
              <p key={status.value}>
                {status.label}: {getTicketAmount("switch", status.value)} (
                {getClassAmount("switch", status.value)})
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };
  if (typeof window !== "undefined") {
    const admin = localStorage.getItem("login_admin");
    if (admin !== "true") {
      Router.push("/login/admin");
    }
  }

  const handleSideBarClick = (item) => {
    if (item !== "capacity") {
      setCapacityShow(false);
    }
    if (item === "out") {
      setUserToShow(users.filter((user) => user["status"] === "out"));
    } else if (item === "canceled") {
      setUserToShow(users.filter((user) => user["status"] === "canceled"));
    } else if (item === "all") {
      setUserToShow(users);
    } else if (levelsToShow.some((level) => level.value === item)) {
      setUserToShow(users.filter((user) => user.level === item));
    } else if (item === "shirt") {
      setUserToShow(users.filter((user) => user["shirt"] === "yes"));
    } else if (item === "additional") {
      setUserToShow(
        users.filter(
          (user) => user["additional"] !== "no" && user["additional"] !== ""
        )
      );
    } else if (item === "email-sent") {
      setUserToShow(users.filter((user) => user["status"] === "email-sent"));
    } else if (item === "reminder") {
      setUserToShow(users.filter((user) => user["status"] === "reminder"));
    } else if (item === "partyPass") {
      setUserToShow(users.filter((user) => user["ticket"] === "partyPass"));
    } else if (item === "confirmed") {
      setUserToShow(users.filter((user) => user["status"] === "confirmed"));
    } else if (item === "waitinglist") {
      setUserToShow(users.filter((user) => user["status"] === "waitinglist"));
    } else if (item === "registered") {
      setUserToShow(users.filter((user) => user["status"] === "registered"));
    } else {
      setUserToShow(users.filter((user) => user[item] === item));
    }
    if (item === "capacity") {
      setCapacityShow(true);
    }
    setActiveSideBar(item);
  };

  const handleUser = (id) => {
    Router.push(`/dashboard/user/${id}`);
  };
  const renderTableHeader = () => {
    const header = [
      "select",
      "status",
      "price",
      "date",
      "actions",
      "id",
      "email",
      "firstname",
      "lastname",
      "ticket",
      "terms",
    ];
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  //--------- Ticket Component
  const TicketsComponent = () => {
    const ticketToshow = [
      { name: "Level", capacity: "Capacity", waiting_list: "Waiting List" },
      ...tickets,
    ];
    return (
      <div className={styles.tickets}>
        {ticketToshow?.map((ticket) => (
          <div key={ticket.name} className={styles.ticketRow}>
            <div className={styles.ticketItem}>
              <p>{ticket.name}</p>
            </div>
            <div className={styles.ticketItem}>
              <p>{ticket.capacity}</p>
            </div>
            <div className={styles.ticketItem}>
              <p>{ticket.waiting_list}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  //--------- Table Data
  const getStatusLabel = (status) => {
    const { label } = statusList.find((item) => item.value === status);
    return label;
  };

  const renderTableData = () => {
    return userToShow
      .filter((user) =>
        nameSearch
          ? user.firstname.toUpperCase().includes(nameSearch.toUpperCase())
          : true
      )
      .sort((a, b) => a.id - b.id)
      .map(
        ({
          id,
          status,
          price,
          date,
          firstname,
          ticket,
          lastname,
          country,
          email,
        }) => {
          return (
            <tr
              key={id}
              className={classNames(styles.normal, {
                [styles.confirmed]: status === "confirmed",
                [styles.canceled]: status === "canceled",
                [styles.out]: status === "out",
                [styles.sent]: status === "email-sent",
                [styles.reminder]: status === "reminder",
              })}
            >
              <td>
                <label>
                  <FormCheckbox
                    style={{ width: "60px" }}
                    {...form}
                    name="users"
                    value={id}
                  />
                </label>
              </td>
              <td>{getStatusLabel(status)}</td>
              <td>{price}</td>
              <td>{date}</td>
              <td>
                <button
                  className={styles.button}
                  onClick={() => handleUser(id)}
                >
                  Edit
                </button>
              </td>
              <td>{id}</td>
              <td>{email}</td>
              <td>{firstname}</td>
              <td>{lastname}</td>
              <td>{ticket}</td>
              <td>Yes</td>
            </tr>
          );
        }
      );
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>VSB 2022</title>
        <link rel="icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amatic+SC&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header
        isAdmin
        title="BFF DASHBOARD"
        menuItems={[
          {
            title: "LOG OUT ",
            link: "/login/admin",
          },
        ]}
      />
      <h3 className={styles.title}>Registrations</h3>
      <div className={styles.total}>
        <p>
          Total Registrations: {users?.length} = {totalAmount}
        </p>
        <p>
          Selected List:{" "}
          {
            userToShow?.filter(
              (user) => user.status !== "canceled" && user.status !== "out"
            )?.length
          }{" "}
          ={totalAmountList}
        </p>
      </div>
      <main className={styles.main}>
        <div className={styles.sideBar}>
          <div
            onClick={() => handleSideBarClick("all")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "all",
            })}
          >
            <p>All</p>
          </div>
          {statusList.map(({ value, label }) => (
            <div
              key={value}
              onClick={() => handleSideBarClick(value)}
              className={classNames(styles.sideBarItem, {
                [styles.active]: activeSideBar === value,
              })}
            >
              <p>{label}</p>
            </div>
          ))}
          <div
            onClick={() => handleSideBarClick("additional")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "additional",
            })}
          >
            <p>Additional Classes</p>
          </div>
          <div
            onClick={() => handleSideBarClick("capacity")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "capacity",
            })}
          >
            <p>Capacity</p>
          </div>
          <div
            onClick={() => handleSideBarClick("balance")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "balance",
            })}
          >
            <p>Balance</p>
          </div>
        </div>
        <div className={styles.content}>
          {activeSideBar !== "balance" && (
            <div className={styles.search}>
              <div>
                <select
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.select}
                >
                  {statusList.map(({ value, label }) => (
                    <option key={status} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.statusButton}
                  onClick={handleStatusChange}
                >
                  Change Status
                </button>
              </div>
              <p>Search first name</p>
              <input onChange={(e) => setNameSearch(e.target.value)} />
            </div>
          )}
          {!capacityShow && activeSideBar !== "balance" && (
            <table className={styles.table}>
              <tbody>
                <tr>{renderTableHeader()}</tr>
                {renderTableData()}
              </tbody>
            </table>
          )}
          {capacityShow && <TicketsComponent />}
          {activeSideBar === "balance" && <BalanceComponent />}
          {activeSideBar !== "balance" && (
            <div className={styles.downloadButton}>
              <CSVLink data={userToShow} filename={"registration-file.csv"}>
                Download CSV
              </CSVLink>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          style={{ width: "auto" }}
          href="https://hamedjenabi.me"
          target="_blank"
          rel="noreferrer"
        >
          Powered with love by Hamed
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  const { getAllUsers, getTickets } = await import("../../db/db");
  const users = await getAllUsers();

  const tickets = await getTickets();
  return {
    props: {
      users: users,
      tickets: tickets,
    },
  };
}

// import Head from "next/head";
// import useMedia from "use-media";
// import Router from "next/router";
// import { CSVLink, CSVDownload } from "react-csv";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import styles from "./Dashboard.module.scss";
// import Header from "../../components/Header/Header.js";
// import { unstable_useFormState as useFormState } from "reakit/Form";
// import classNames from "classnames";

// export default function Dashboard({ users, tickets }) {
//   const [nameSearch, setNameSearch] = useState("");
//   const [activeSideBar, setActiveSideBar] = useState("all");
//   const [capacityShow, setCapacityShow] = useState(false);
//   const [userToShow, setUserToShow] = useState(users || []);
//   const isMobile = useMedia({ maxWidth: "768px" });

//   if (typeof window !== "undefined") {
//     const admin = localStorage.getItem("login_admin");
//     if (admin !== "true") {
//       Router.push("/login/admin");
//     }
//   }

//   const handleSideBarClick = (item) => {
//     if (item !== "capacity") {
//       setCapacityShow(false);
//     }
//     if (item === "canceled") {
//       setUserToShow(users.filter((user) => user["status"] === "canceled"));
//     } else if (item === "all") {
//       setUserToShow(users);
//     } else if (item === "levelOne") {
//       setUserToShow(users.filter((user) => user["level"] === "levelOne"));
//     } else if (item === "levelTwo") {
//       setUserToShow(users.filter((user) => user["level"] === "levelTwo"));
//     } else if (item === "levelThree") {
//       setUserToShow(users.filter((user) => user["level"] === "levelThree"));
//     } else if (item === "partyPass") {
//       setUserToShow(users.filter((user) => user["ticket"] === "partyPass"));
//     } else if (item === "confirmed") {
//       setUserToShow(users.filter((user) => user["status"] === "confirmed"));
//     } else {
//       setUserToShow(
//         users.filter((user) => user[item] === true || user[item] === "yes")
//       );
//     }
//     if (item === "capacity") {
//       setCapacityShow(true);
//     }
//     setActiveSideBar(item);
//   };

//   const handleUser = (id) => {
//     Router.push(`/dashboard/user/${id}`);
//   };
//   const renderTableHeader = () => {
//     const header = [
//       "status",
//       "actions",
//       "id",
//       "email",
//       "firstname",
//       "lastname",
//       "ticket",
//       "role",
//       "level",
//       "brunch",
//       "shirt",
//       "shirt_size",
//       "country",
//       "terms",
//     ];
//     return header.map((key, index) => {
//       return <th key={index}>{key.toUpperCase()}</th>;
//     });
//   };

//   const BalanceComponent = () => {
//     const getTicketAmount = (level, role) => {
//       const ammount = users.filter(
//         (user) =>
//           user["level"] === level &&
//           user["role"] === role &&
//           user["status"] === "confirmed"
//       );
//       return ammount.length;
//     };
//     console.log("users", users);
//     console.log("hello", getTicketAmount("levelThree", "lead"));
//     return (
//       <div className={styles.balanceComponent}>
//         <div className={styles.ticketRow}>
//           <p>Level</p>
//           <p> Follow</p> <p>Lead</p>
//         </div>
//         <div className={styles.ticketRow}>
//           <p>Level 1</p>
//           <p>{getTicketAmount("levelOne", "follow")}</p>{" "}
//           <p>{getTicketAmount("levelOne", "lead")}</p>
//         </div>
//         <div className={styles.ticketRow}>
//           <p>Level 2</p>
//           <p>{getTicketAmount("levelTwo", "follow")}</p>{" "}
//           <p>{getTicketAmount("levelTwo", "lead")}</p>
//         </div>
//         <div className={styles.ticketRow}>
//           <p>Level 3</p>
//           <p>{getTicketAmount("levelThree", "follow")}</p>{" "}
//           <p>{getTicketAmount("levelThree", "lead")}</p>
//         </div>
//       </div>
//     );
//   };
//   //--------- Ticket Component
//   const TicketsComponent = () => {
//     const ticketToshow = [
//       { name: "Level", capacity: "Capacity", waiting_list: "Waiting List" },
//       ...tickets,
//     ];
//     return (
//       <div className={styles.tickets}>
//         {ticketToshow?.map((ticket) => (
//           <div key={ticket.name} className={styles.ticketRow}>
//             <div className={styles.ticketItem}>
//               <p>{ticket.name}</p>
//             </div>
//             <div className={styles.ticketItem}>
//               <p>{ticket.capacity}</p>
//             </div>
//             <div className={styles.ticketItem}>
//               <p>{ticket.waiting_list}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };
//   //--------- Table Data
//   const renderTableData = () => {
//     return userToShow
//       .filter((user) =>
//         nameSearch
//           ? user.firstname.toUpperCase().includes(nameSearch.toUpperCase())
//           : true
//       )
//       .sort((a, b) => a.id - b.id)
//       .map(
//         ({
//           id,
//           status,
//           role,
//           firstname,
//           lastname,
//           country,
//           level,
//           brunch,
//           shirt,
//           shirt_size,
//           ticket,
//           email,
//         }) => {
//           return (
//             <tr
//               className={classNames(styles.normal, {
//                 [styles.confirmed]: status === "confirmed",
//                 [styles.canceled]: status === "canceled",
//               })}
//               key={id}
//             >
//               <td>{status}</td>
//               <td>
//                 <button
//                   className={styles.button}
//                   onClick={() => handleUser(id)}
//                 >
//                   Edit
//                 </button>
//               </td>
//               <td>{id}</td>
//               <td>{email}</td>
//               <td>{firstname}</td>
//               <td>{lastname}</td>
//               <td>{ticket}</td>
//               <td>{role}</td>
//               <td>{level}</td>
//               <td>{brunch}</td>
//               <td>{shirt}</td>
//               <td>{shirt_size}</td>
//               <td>{country}</td>
//               <td>Yes</td>
//             </tr>
//           );
//         }
//       );
//   };
//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Vienna Sugar Blues</title>
//         <link rel="icon" href="/icon.png" />
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Amatic+SC&display=swap"
//           rel="stylesheet"
//         />
//       </Head>
//       <Header
//         isAdmin
//         title="VSB DASHBOARD"
//         menuItems={[
//           {
//             title: "LOG OUT ",
//             link: "/login/admin",
//           },
//         ]}
//       />
//       <h3 className={styles.title}>Registrations</h3>
//       <div className={styles.total}>
//         <p>Total Registrations: {users?.length}</p>
//         <p>Selected List: {userToShow?.length}</p>
//       </div>
//       <main className={styles.main}>
//         <div className={styles.sideBar}>
//           <div
//             onClick={() => handleSideBarClick("all")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "all",
//             })}
//           >
//             <p>All</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("confirmed")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "confirmed",
//             })}
//           >
//             <p>confirmed</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("levelOne")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "levelOne",
//             })}
//           >
//             <p>Level1</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("levelTwo")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "levelTwo",
//             })}
//           >
//             <p>Level2</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("levelThree")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "levelThree",
//             })}
//           >
//             <p>Level3</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("partyPass")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "partyPass",
//             })}
//           >
//             <p>Partypass</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("brunch")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "brunch",
//             })}
//           >
//             <p>Brunch</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("shirt")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "shirt",
//             })}
//           >
//             <p>Tshirt</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("canceled")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "canceled",
//             })}
//           >
//             <p>Canceled</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("capacity")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "capacity",
//             })}
//           >
//             <p>Capacity</p>
//           </div>
//           <div
//             onClick={() => handleSideBarClick("balance")}
//             className={classNames(styles.sideBarItem, {
//               [styles.active]: activeSideBar === "balance",
//             })}
//           >
//             <p>Balance</p>
//           </div>
//         </div>
//         <div className={styles.content}>
//           {activeSideBar !== "balance" && (
//             <div className={styles.search}>
//               <p>Search first name</p>
//               <input onChange={(e) => setNameSearch(e.target.value)} />
//             </div>
//           )}
//           {!capacityShow && activeSideBar !== "balance" && (
//             <table className={styles.table}>
//               <tbody>
//                 <tr>{renderTableHeader()}</tr>
//                 {renderTableData()}
//               </tbody>
//             </table>
//           )}
//           {capacityShow && <TicketsComponent />}
//           {/* <button
//             onClick={() => handleCsv(userToShow)}
//             className={styles.button}
//           >
//             Export "{activeSideBar}" to CSV
//           </button> */}
//           {activeSideBar === "balance" && <BalanceComponent />}
//           {activeSideBar !== "balance" && (
//             <div className={styles.downloadButton}>
//               <CSVLink data={userToShow} filename={"registration-file.csv"}>
//                 Download CSV
//               </CSVLink>
//             </div>
//           )}
//         </div>
//       </main>

//       <footer className={styles.footer}>
//         <a
//           style={{ width: "auto" }}
//           href="https://hamedjenabi.me"
//           target="_blank"
//           rel="noreferrer"
//         >
//           Powered with love by Hamed
//         </a>
//       </footer>
//     </div>
//   );
// }

// export async function getServerSideProps() {
//   const { getAllUsers, getTickets } = await import("../../db/db");

//   const users = await getAllUsers();
//   const tickets = await getTickets();
//   return {
//     props: {
//       users: users,
//       tickets: tickets,
//     },
//   };
// }
