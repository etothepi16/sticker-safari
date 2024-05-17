import express from "express"
import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously } from "firebase/auth"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import { firebaseConfig } from "./config.js"
// Initialize Firebase
const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore(app)

// Initialize Express
const expressApp = express()
const port = 3000
expressApp.set("views", "./src/views")
expressApp.use(express.static("./dist"))
expressApp.set("view engine", "pug")

expressApp.get("/", (_, res) => {
  res.send("Hello World!")
})

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Logged in as ", user.uid)
  } else {
    console.log(
      "There was no anonymous session. Creating a new anonymous user."
    )
    signInAnonymously(auth).catch((error) => {
      if (error.code === "auth/operation-not-allowed") {
        window.alert(
          "Anonymous Sign-in failed. Please make sure that you have enabled anonymous " +
            "sign-in on your Firebase project."
        )
      } else {
        console.error(error)
      }
    })
  }
})

const logVisit = async (req, _, next) => {
  const item = req.query.item
  let user = auth.currentUser
  if (!user) {
    user = await signInAnonymously(auth)
  }
  const uid = user.uid
  if (item)
    setDoc(doc(db, "users", uid), { uid, [item]: true }, { merge: true })
      .then(() => {
        console.log("visit logged!")
        next()
      })
      .catch((e) => console.error(e))
  else next()
}

expressApp.use("/:eventId", logVisit)
expressApp.get("/:eventId", (req, res) => {
  res.render("event", { eventId: req.params.eventId, item: req.query.item })
})

expressApp.listen(port, () => {
  console.log(`App listening at on ${port}!`)
})
