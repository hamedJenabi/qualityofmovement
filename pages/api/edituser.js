import {
  titleCase,
  discounts,
  levelsToShow,
  statusList,
} from "../../utils/functions";
import {
  updateUserInfo,
  removeFromWaitingList,
  removeFromCapacity,
  addToWaitingList,
  getTicketByName,
  addToCapacity,
} from "../../db/db";
const getLevelLabelForEmail = (level) => {
  if (level === "") {
    return "";
  }
  if (level !== "") {
    const title = levelsToShow?.find((item) => item.value === level)?.label;
    return titleCase(title);
  }
};
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//******** Level & Ticket Label *********/
const getLevelLabel = (level) => {
  if (level === "levelOne") {
    return "Level 1";
  }
  if (level === "levelTwo") {
    return "Level 2";
  }
  if (level === "levelThree") {
    return "Level 3";
  }
  if (level === "") {
    return "";
  }
};
const getTicketLabel = (ticket) => {
  if (ticket === "partyPass") {
    return "Party Pass";
  }
  if (ticket === "social_pass") {
    return "Social Pass";
  }
};
export default async function edituser(req, response) {
  const statusListValues = [
    "registered",
    "reminder",
    "email-sent",
    "confirmed",
    "waitinglist",
    "canceled",
    "out",
  ];
  const time = new Date();
  const date = new Date().toISOString();

  const requestData = {
    status: req.body.status,
    prevStatus: req.body.prevStatus,
    date: time.toDateString(),
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    country: req.body.country,
    role: req.body.role ?? "",
    ticket: req.body.ticket ?? "",
    shirt: req.body.shirt ?? "",
    brunch: req.body.brunch ?? "",
    additional: req.body.additional ?? "",
    shirt_size: req.body.shirt_size ?? "",
    price: req.body.price,
    terms: req.body.terms,
  };

  console.log("requestData", requestData);
  const totalPrice = requestData.price;
  /***** GET PRICE AND LEVEL */
  const level = titleCase(requestData.level);
  const ticket = getTicketLabel(requestData.ticket);
  //******** Send Email *********/
  const sendEmail = async (msg) => {
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  };
  let template = "";
  if (!statusListValues.includes(req.body.status)) {
    response.status(401).json();
  } else {
    if (req.body.status === "email-sent") {
      // if (requestData.prevStatus === "waitinglist") {
      //   const ticketName =
      //     requestData.ticket === "partyPass"
      //       ? requestData.ticket
      //       : `${requestData.level}_${requestData.role}`;
      //   const { id: ticketId } = await getTicketByName(ticketName);
      //   await removeFromWaitingList(ticketId);
      //   await addToCapacity(ticketId);
      // }
      template = "d-052f0896595a46a2910c4f07f4ecd856";
      const msg = {
        from: "hamed.jenabi@gmail.com",
        to: `${requestData.email}`,
        template_id: template,
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          additional: `${requestData.additional}`,
          brunch: `${requestData.brunch}`,
          shirt: `${requestData.shirt}`,
          shirtSize: `${requestData.shirt_size}`,
          ticket: `${ticket}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "reminder") {
      template = "d-e066956322ae4e05951205eb556ba500";
      const msg = {
        from: "hamed.jenabi@gmail.com",
        to: `${requestData.email}`,
        template_id: template,
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          date: `${requestData.date}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          additional: `${requestData.additional}`,
          brunch: `${requestData.brunch}`,
          shirt: `${requestData.shirt}`,
          shirtSize: `${requestData.shirt_size}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "waitinglist") {
      const msg = {
        from: "hamed.jenabi@gmail.com",
        to: `${requestData.email}`,
        template_id: "d-75944ebe0ce746299129ec916c7704e0",
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          additional: `${requestData.additional}`,
          brunch: `${requestData.brunch}`,
          shirt: `${requestData.shirt}`,
          shirtSize: `${requestData.shirt_size}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "confirmed") {
      const msg = {
        from: "hamed.jenabi@gmail.com",
        to: `${requestData.email}`,
        template_id: "d-90540c940e424574af63fcba1bf9e7b2",
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          additional: `${requestData.additional}`,
          brunch: `${requestData.brunch}`,
          shirt: `${requestData.shirt}`,
          shirtSize: `${requestData.shirt_size}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    // and more conditions
    if (req.body.status === "out") {
      const msg = {
        from: "thegrindhelsinki@gmail.com",
        to: `${requestData.email}`,
        template_id: "d-5485670ec4ff45e98553fdb8f82fb178",
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          additional: `${requestData.additional}`,
          brunch: `${requestData.brunch}`,
          shirt: `${requestData.shirt}`,
          shirtSize: `${requestData.shirt_size}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "cancelled") {
      const ticketName =
        requestData.ticket === "partyPass"
          ? requestData.ticket
          : `${requestData.level}_${requestData.role}`;
      const { id: ticketId } = await getTicketByName(ticketName);
      if (requestData.prevStatus === "waitinglist") {
        await removeFromWaitingList(ticketId);
      } else {
        await removeFromCapacity(ticketId);
      }
    }
    await updateUserInfo(req.body, totalPrice);
    response.status(200).json();
  }
}

// import {
//   updateUserInfo,
//   getTicketByName,
//   removeFromCapacity,
//   removeFromWaitingList,
// } from "../../db/db";

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// //******** Level & Ticket Label *********/
// const getLevelLabel = (level) => {
//   if (level === "levelOne") {
//     return "Level 1";
//   }
//   if (level === "levelTwo") {
//     return "Level 2";
//   }
//   if (level === "levelThree") {
//     return "Level 3";
//   }
//   if (level === "") {
//     return "";
//   }
// };
// const getTicketLabel = (ticket) => {
//   if (ticket === "partyPass") {
//     return "Party Pass";
//   }
//   if (ticket === "fullpass") {
//     return "Full Pass";
//   }
// };
// export default async function edituser(req, response) {
//   const statusList = [
//     "registered",
//     "accepted",
//     "confirmed",
//     "reminder",
//     "waitinglist",
//     "canceled",
//   ];
//   const requestData = {
//     status: req.body.status,
//     prevStatus: req.body.prevStatus,
//     email: req.body.email,
//     firstname: req.body.firstname,
//     lastname: req.body.lastname,
//     country: req.body.country,
//     role: req.body.role ?? "",
//     ticket: req.body.ticket ?? "",
//     level: req.body.level,
//     brunch: req.body.brunch,
//     shirt: req.body.shirt,
//     shirtSize: req.body.shirt_size,
//     terms: true,
//   };
//   /***** GET PRICE AND LEVEL */
//   const level = getLevelLabel(requestData.level);
//   const ticket = getTicketLabel(requestData.ticket);
//   const price = requestData.ticket === "partyPass" ? 85 : 185;
//   const additionalBrunch = requestData.brunch === "yes" ? 20 : 0;
//   const additionalShirt = requestData.shirt === "yes" ? 20 : 0;
//   const totalPrice = price + additionalBrunch + additionalShirt;

//   //******** Send Email *********/
//   const sendEmail = async (msg) => {
//     sgMail
//       .send(msg)
//       .then(() => {
//         console.log("Email sent");
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   };

//   if (!statusList.includes(req.body.status)) {
//     response.status(401).json();
//   } else {
//     if (req.body.status === "registered") {
//       const msg = {
//         from: "hamed.jenabi@gmail.com",
//         to: `${requestData.email}`,
//         template_id: "d-b390012c575a4f2796429087994ab214",
//         dynamic_template_data: {
//           firstname: `${requestData.firstname}`,
//           lastname: `${requestData.lastname}`,
//           country: `${requestData.country}`,
//           role: `${requestData.role}`,
//           level: `${level}`,
//           ticket: `${ticket}`,
//           brunch: `${requestData.brunch}`,
//           shirt: `${requestData.shirt}`,
//           shirtSize: `${requestData.shirtSize}`,
//           terms: `${requestData.terms}`,
//           status: `${requestData.status}`,
//           price: `${totalPrice}`,
//         },
//       };
//       await sendEmail(msg);
//     }
//     if (req.body.status === "confirmed") {
//       const msg = {
//         from: "hamed.jenabi@gmail.com",
//         to: `${requestData.email}`,
//         template_id: "d-fdd76b834f0744518ba6abaa97086e98",
//         dynamic_template_data: {
//           firstname: `${requestData.firstname}`,
//           lastname: `${requestData.lastname}`,
//           country: `${requestData.country}`,
//           role: `${requestData.role}`,
//           level: `${level}`,
//           ticket: `${ticket}`,
//           brunch: `${requestData.brunch}`,
//           shirt: `${requestData.shirt}`,
//           shirtSize: `${requestData.shirtSize}`,
//           terms: `${requestData.terms}`,
//           status: `${requestData.status}`,
//           price: `${totalPrice}`,
//         },
//       };
//       await sendEmail(msg);
//     }
//     if (req.body.status === "reminder") {
//       const msg = {
//         from: "hamed.jenabi@gmail.com",
//         to: `${requestData.email}`,
//         template_id: "d-9b359ea68ad24de48435368c501b7b4d",
//         dynamic_template_data: {
//           firstname: `${requestData.firstname}`,
//           lastname: `${requestData.lastname}`,
//           country: `${requestData.country}`,
//           role: `${requestData.role}`,
//           level: `${level}`,
//           ticket: `${ticket}`,
//           brunch: `${requestData.brunch}`,
//           shirt: `${requestData.shirt}`,
//           shirtSize: `${requestData.shirtSize}`,
//           terms: `${requestData.terms}`,
//           status: `${requestData.status}`,
//           price: `${totalPrice}`,
//         },
//       };
//       await sendEmail(msg);
//     }
//     if (req.body.status === "canceled") {
//       const ticketName =
//         requestData.ticket === "partyPass"
//           ? requestData.ticket
//           : `${requestData.level}_${requestData.role}`;
//       const { id: ticketId } = await getTicketByName(ticketName);
//       if (requestData.prevStatus === "waitinglist") {
//         await removeFromWaitingList(ticketId);
//       } else {
//         await removeFromCapacity(ticketId);
//       }
//     }
//     await updateUserInfo(req.body);
//     response.status(200).json();
//   }
// }
