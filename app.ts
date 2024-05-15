import express, { Express, Request, Response } from "express"
import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously } from "firebase/auth"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import path from "path"
import { firebaseConfig } from "./config.ts"
// Initialize Firebase
const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore(app)

// Initialize Express
const expressApp: Express = express()
const port = 3000

expressApp.set("view engine", "pug")
expressApp.use(express.static(path.join(__dirname, "public")))
expressApp.get("/", (_: Request, res: Response) => {
  res.send("Hello World!")
})

const logVisit = (req: Request, _: Response, next: Function) => {
  const item = req.query.item as string
  let user = auth.currentUser

  if (!user) {
    signInAnonymously(auth)
      .then((cred) => (user = cred.user))
      .catch((error) => {
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

  const uid = user!.uid

  setDoc(doc(db, "users", uid), { uid, [item]: true }, { merge: true })
    .then(() => console.log("visit logged!"))
    .catch((e) => console.error(e))
    .finally(() => next())
}

expressApp.use(logVisit)
expressApp.get("/:eventId", (req, res) => {
  res.render("event", { eventId: req.params.eventId, item: req.query.item })
})

expressApp.use((err: Error, _: Request, res: Response, next: Function) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render("error", { error: err.message, stack: err.stack })
})

expressApp.listen(port, () => {
  console.log(`App listening at on ${port}!`)
})
