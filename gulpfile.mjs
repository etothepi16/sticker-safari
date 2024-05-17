import { dest, parallel, src, watch } from "gulp"
import imagemin, { optipng } from "gulp-imagemin"
import pug from "gulp-pug"
import gulpSass from "gulp-sass"
import * as dartSass from "sass"

const input = {
  sass: "src/stylesheets/*.sass",
  pug: "src/views/**/*.pug",
  images: "src/images/**/*.png",
}

const output = {
  sass: "dist/stylesheets",
  pug: "dist",
  images: "dist/images",
}

const sass = gulpSass(dartSass)

function buildCSS() {
  console.log("\x1B[92mBuilding CSS\x1B[0m")
  return src(input.sass)
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(output.sass))
}

function buildHTML() {
  console.log("\x1B[93mBuilding HTML\x1B[0m")
  return src(input.pug)
    .pipe(
      pug({
        doctype: "html",
        pretty: true,
      })
    )
    .pipe(dest(output.pug))
}

function moveImages() {
  console.log("\x1B[96mMoving images\x1B[0m")
  return src(input.images, { encoding: false })
    .pipe(imagemin([optipng()]))
    .pipe(dest(output.images))
}

function watchFiles() {
  console.log("\x1B[97mWatching files\x1B[0m")
  watch(input.sass, buildCSS)
  watch(input.pug, buildHTML)
  watch(input.images, moveImages)
}

export default parallel(buildCSS, buildHTML, moveImages, watchFiles)
