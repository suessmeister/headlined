from datetime import datetime

# Format the current date (e.g., "Tuesday, 07 May, 2025")
today = datetime.now().strftime("%A, %d %B, %Y")

raw_html= """

<link
   href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=Playfair+Display+SC:wght@900&family=Playfair+Display:ital,wght@0,800;1,800&family=Manrope:wght@800&display=swap"
   rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css">
<link rel='stylesheet'
   href='https://cdnjs.cloudflare.com/ajax/libs/simple-line-icons/2.4.1/css/simple-line-icons.min.css'>


   <div class="main__wrapper">
      <main>
         <h1>Headlines</h1>
         <aside>
            <div>
               <div class="issue">Issue #1 </div>
               <div class="date">Tuesday, 26 May, 2020</div>
               <div class="edition">Two memes Edition</div>
            </div>
         </aside>
         <h2 class="title--large main-title">Woman spends too much time on Codepens despite advice; no plans to stop</h2>
         <div class="main-text multi-column">
            <p>Sometimes, Internet users land themselves in an uncommon situation where an app or website can be used for
               both work and personal situations. Well, a young front-end designer was spending up to 13 hours on the site,
               Codepen for work and her hobby, which unfortunately, is also coding. </p>
            <p>The designer, whose work includes a <em>To-Do Terrarium</em>, clarified, "Well, I didn't <em> have </em>to
               use it for work but it was already part of my workflow. It just made sense as it was more efficient." The
               biggest issue, she said, is that she would hop on Codepen for work, but would get distracted by pens made by
               others in the community for unexpectedly long periods of time, which then causes her to spend even more time
               on the site.</p>
            <p> "I mean, that's terrible right?" she asked. Codepen, which brands itself as the best place to build, test,
               and discover front-end code, has declined to comment at this time.</p>
         </div><a class="terrarium" href="https://codepen.io/oliviale/full/oNXJgEM" target="_blank">
            <figure><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-terrarium.jpg" />
               <figcaption>A to-do list that grows succulents when you've completed a task</figcaption>
            </figure>
         </a><a class="item-with-image plan span--2 long--2" href="https://codepen.io/oliviale/full/moLrBq"
            target="_blank"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-floorplan.jpg" />
            <h4>Can you get inspired to make your own floor plans?</h4>
            <div class="multi-column">
               <p>Making a floor Plan with CSS Grid? Talk about using the wrong tool for the job. But I guess this is what
                  happens when someone isn't happy with any of the floor plans found on Pinterest; she'll start making her
                  own for the eventual home that she will never own. Nevertheless, there's a home office with a large
                  window to look out of pensively during rainy days and a ton of "white space" for the cats to run around.
               </p>
            </div>
         </a><a class="hogwarts" href="https://codepen.io/oliviale/full/MZZYyO" target="_blank">
            <div class="hogwarts__title">50% Off Hogwarts Express tickets</div>
            <div class="hogwarts__image"> <span>Limited time offer</span><img
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-hogwarts.svg" /></div>
         </a><a class="item-with-image pasta with-border" href="https://codepen.io/oliviale/full/zYvxXWw" target="_blank">
            <h4>A pasta menu</h4>
            <p>Everybody loves pasta. It's impossible to not love them, so here are 15 recipes, served with GSAP. Note the
               easter egg — the menu icon changes according to the pasta that you choose.</p>
         </a><a class="item-with-image magazine with-border" href="https://codepen.io/oliviale/full/GRKQoKM"
            target="_blank">
            <h4>Marvel at a magazine</h4>
            <p>A tribute of sorts to an era of cool superhero movies, this is a Marvel-themed magazine! Recommended,
               because it took 45 hours, so you know some serious dedication has been poured into this.</p>
         </a><a class="item-with-image style" href="https://codepen.io/collection/XJyNPm" target="_blank">
            <h4>Let's adopt, don't shop.</h4>
            <p>Explore a style guide and various page layouts for a pet adoption site in the <em>Style Guide</em>
               collection. Inspired by the <em>Atomic Design</em> principle, this 8-pen collection includes a 404 page
               concept, an admin dashboard and what a Twitter user calls a 'media card zen garden'. Each pen comes with
               five (yes, five) color themes, including the precious dark mode.</p>
         </a><a class="item-with-image toggles" href="https://codepen.io/oliviale/full/xxboXzo" target="_blank"><img
               src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-toggle.gif" />
            <h4>Toggles</h4>
            <p>Eight playful toggles to toggle on and off for your amusement. Is it possible to use these on your site and
               still adhere to assessibility rules? No. But there's a really cute dog one you <em>have </em>to see.</p>
         </a><a class="menu" href="https://codepen.io/oliviale/full/LYYrKMV" target="_blank">
            <figure><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-menu.jpg" />
               <figcaption>See the new and improved menu for Toasty!</figcaption>
            </figure>
         </a><a class="social" href="https://codepen.io/oliviale/full/QWjjrZX" tagrget="_blank"><img class="social__image"
               src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-social.gif" />
            <div class="social__subtitle">World News</div>
            <div class="social__content">Looks like Covid-19 is gonna be around for a while so here is another friendly
               reminder to practice social distancing. Oh, and wear a mask! </div>
         </a>
         <div class="item-with-image cssgrid-collection"><a class="cssgrid-collection__image"
               href="https://codepen.io/collection/DQvYpQ" target="_blank"><img
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-co-grid.jpg" /></a>
            <div class="cssgrid-collection__content">
               <h4> <a href="https://codepen.io/collection/DQvYpQ" target="_blank">More CSS Grid things like this one.
                     Shelves, coupons and more! </a></h4>
               <div class="multi-column-3">
                  <p>Get your fill of more CSS Grid items in this collection. There are a total of 32 pens to date... well,
                     33, if you count this one too. What can you expect in this collection? The hidden gems, in my totally
                     unbiased opinion, are <a href="https://codepen.io/oliviale/full/wbyVWr" target="_blank">the recreation
                        of the Pac-Man layout</a> and <a href="https://codepen.io/oliviale/pen/wbyVWr"
                        target="_blank">coupons inspired by junk mail</a>. A lot of joke items of things that shouldn't be
                     done in CSS Grid, such as <a href="https://codepen.io/oliviale/full/PXGgMG" target="_blank">a
                        shelf</a>? <a href="https://codepen.io/oliviale/full/qggOog" target="_blank">Bathroom tiles
                        wtf</a>? and <a href="https://codepen.io/oliviale/full/bOWqbj" target="_blank">makeup palettes
                     </a>. If you are a cultured person, you will have a chance to enjoy a couple of pens inspired by <a
                        href="https://codepen.io/oliviale/full/JxVZpX" target="_blank">Harry Potter </a>and <a
                        href="https://codepen.io/oliviale/full/RwNdeeQ" target="_blank">Pokemon.</a> On the rare occasion
                     that you are looking at this profile for something you can use in production, you really shouldn't.
                     But, there are <em> some </em>real-world applications, such as <a
                        href="https://codepen.io/oliviale/full/GPXozx" target="_blank">the recipe layout</a>, <a
                        href="https://codepen.io/oliviale/full/pqoEoJ" target="_blank">the product catalog</a>, and <a
                        href="https://codepen.io/oliviale/full/XyqQYL" target="_blank">color palettes for a style
                        guide</a>.</p>
               </div>
            </div>
         </div>
         <div class="sidebar">
            <h3 class="title--big">Hot this month</h3><a class="codepen-item pie"
               href="https://codepen.io/oliviale/full/BaovGmg" target="_blank"><img class="pie__image"
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-pie.jpg" />
               <div class="pie__subtitle">Food </div>
               <div class="pie__content">
                  <h4>Pies for everyone!</h4>
                  <p>No man is left behind. There's infinite pie with this one div and a repeating background.</p>
               </div>
            </a><a class="sidebar-item captcha" href="https://codepen.io/oliviale/full/RwWdNRd" target="_blank">
               <h5>Frustrated designer runs amok with Captcha ideas</h5>
               <p>From Tic Tac Toe to solving meme-based questions, this is a different take on how web captchas should be.
                  "I have not successfully picked out all photos of a truck on the first try. Something's gotta change,"
                  says the designer, who has requested to remain anonymous.</p>
            </a><a class="sidebar-item slack-ui with-border" href="https://codepen.io/oliviale/full/GRpvNBa"
               target="_blank">
               <h5>Slack UI gets reverse engineered</h5>
               <p>Another valiant effort to reverse engineer a web app. However, the UI is repurposed to showcase Codepens
                  instead of mock conversations. This is a codepen showcase inception situation.</p>
            </a><a class="workout" href="https://codepen.io/oliviale/full/RwWKybY" target="_blank">
               <div class="workout__image"><img
                     src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-workout.jpg" alt="Workout" /></div>
               <div class="workout__blurb">Always failing to keep track of your workouts? </div>
               <div class="workout__title">Use this tool!</div>
            </a>
         </div>
      </main>
      </div>
<style> 
      :root {
      --font: "EB Garamond", serif;
      --font-title: "Playfair Display", serif;
      --font-sans-serif: "Manrope", sans-serif;
      --black: #1c1f33;
      --black--acc: #222;
      --gray: #eee;
      --gray-1: #ededed;
      }
      
      * {
      box-sizing: border-box;
      }
      
      body {
      font-size: 1.1rem;
      background: var(--preview-bg);
      font-family: var(--font);
      color: var(--black);
      background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/paper_fibers.png) repeat;
      padding: 4rem 2rem;
      line-height: 1.3;
      text-align: justify;
      column-break-inside: avoid;
      }
      
      a {
      text-decoration: none;
      display: block;
      color: var(--black);
      }
      a:hover, a:focus, a:active, a:visited {
      color: var(--black--acc);
      }
      
      .main__wrapper {
      max-width: 1135px;
      margin: auto;
      }
      
      h1 {
      font: 50px/1 "Playfair Display SC";
      text-align: center;
      }
      @media (min-width: 700px) {
      h1 {
      font: 70px/1 "Playfair Display SC";
      }
      }
      
      h3 {
      font: italic 20px var(--font-title);
      margin-bottom: 1rem;
      }
      
      h4 {
      font: 20px/1.2 var(--font-title);
      }
      
      h5 {
      font: 700 20px/1 var(--font);
      transition: 0.3s ease;
      }
      
      p {
      line-height: 1.3;
      }
      p a {
      display: inline;
      }
      
      em {
      font-style: italic;
      }
      
      .title--large {
      font-family: var(--font-title);
      font-size: 32px;
      font-style: italic;
      text-align: left;
      margin-bottom: 0.8rem;
      }
      @media (min-width: 700px) {
      .title--large {
      font-size: 42px;
      margin: 0;
      }
      }
      
      @media (min-width: 700px) {
      main {
      display: grid;
      grid-template-columns: repeat(4, 1fr) 23%;
      grid-template-rows: repeat(5, auto);
      grid-gap: 1.2rem;
      }
      }
      main h1,
      main aside {
      grid-column: 1/-1;
      }
      @media (min-width: 700px) {
      main .main-title {
      grid-column: 1/-1;
      }
      }
      @media (min-width: 1024px) {
      main .main-title {
      grid-column: 1/-2;
      }
      }
      @media (min-width: 700px) {
      main .terrarium {
      grid-column: 1/-1;
      }
      }
      @media (min-width: 1024px) {
      main .terrarium {
      grid-column: 3/span 2;
      }
      }
      @media (min-width: 700px) {
      main .main-text {
      grid-column: span 5;
      }
      }
      @media (min-width: 1024px) {
      main .main-text {
      grid-column: span 2;
      }
      }
      @media (min-width: 700px) {
      main .sidebar {
      grid-column: 1/-1;
      }
      }
      @media (min-width: 1024px) {
      main .sidebar {
      grid-row: 3/9;
      grid-column: 5/6;
      }
      }
      main .social {
      grid-column: 1/-2;
      grid-row: 8/9;
      }
      main .article-bar-1 {
      grid-row: span 4;
      }
      @media (min-width: 700px) {
      main .hogwarts {
      grid-row: span 3;
      }
      }
      @media (min-width: 1024px) {
      main .hogwarts {
      grid-column: 3;
      grid-row: span 2;
      }
      }
      @media (min-width: 700px) {
      main .menu {
      grid-column: 1/-1;
      grid-row: 13;
      }
      }
      @media (min-width: 1024px) {
      main .menu {
      grid-row: 7/8;
      grid-column: 2/4;
      }
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      main .toggles {
      grid-column: 3/6;
      grid-row: 10/13;
      }
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      main .plan {
      grid-column: span 4;
      }
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      main .style,
      main .magazine,
      main .pasta {
      grid-column: 1/3;
      }
      }
      main .cssgrid-collection {
      grid-column: 1/-1;
      grid-row: 9;
      }
      
      .span--2 {
      grid-column: span 2;
      }
      
      .long--2 {
      grid-row: span 2;
      }
      
      .long--4 {
      grid-row: span 4;
      }
      
      .with-border {
      border-top: 1px solid;
      padding-top: 0.6rem;
      }
      
      img {
      width: 100%;
      filter: grayscale(95%);
      margin-bottom: 0.5rem;
      border: 1px solid var(--black);
      transition: 0.3s ease;
      }
      
      figcaption {
      font-style: italic;
      font-size: 90%;
      }
      
      aside {
      text-align: center;
      padding: 3px 0;
      border: solid var(--black);
      border-width: 2px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 1.5rem 0;
      }
      @media (min-width: 700px) {
      aside {
      margin: 0;
      }
      }
      aside > div {
      display: flex;
      align-items: center;
      border: solid var(--black);
      border-width: 1px 0;
      }
      aside > div > div {
      flex: 1;
      padding: 8px;
      }
      
      @media (min-width: 700px) {
      .multi-column {
      column-count: 2;
      column-gap: 1.3rem;
      margin-top: 0.75rem;
      }
      .multi-column-3 {
      column-count: 3;
      }
      }
      .sidebar {
      margin-top: 3rem;
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      .sidebar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      margin: 0;
      }
      .sidebar h3 {
      width: 100%;
      text-align: center;
      }
      .sidebar > a {
      flex: 0 1 48%;
      margin: 1.5rem 0;
      padding: 0;
      }
      .sidebar .slack-ui {
      border-top: 0;
      }
      .sidebar .pie {
      order: 3;
      }
      }
      @media (min-width: 1024px) {
      .sidebar {
      display: block;
      border-left: 1px solid;
      padding-left: 1.2rem;
      margin: 0;
      }
      }
      
      .main-text.multi-column {
      margin: 0;
      }
      .main-text.multi-column p {
      margin-bottom: 0.8rem;
      }
      
      .hogwarts {
      text-align: center;
      height: 100%;
      border: 2px solid transparent;
      outline: 3px solid var(--black);
      box-shadow: inset 0 0 0 1px var(--black);
      width: calc(100% - 4px);
      margin: 1.5rem auto;
      overflow: hidden;
      }
      @media (min-width: 700px) {
      .hogwarts {
      margin: 0;
      }
      }
      .hogwarts__title {
      font: 800 24px/1 var(--font-sans-serif);
      text-transform: uppercase;
      background: var(--black);
      color: var(--gray);
      padding: 0.8rem 0.8rem 0.9rem;
      transition: 0.2s ease;
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      .hogwarts__title {
      font: 800 21px/1.2 var(--font-sans-serif);
      padding: 1.5rem 0.5rem;
      }
      }
      .hogwarts__image {
      height: 100%;
      position: relative;
      }
      .hogwarts__image img {
      transform: rotate(60deg);
      height: 150%;
      position: absolute;
      border: 0;
      width: 250%;
      left: -70%;
      bottom: -35%;
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      .hogwarts__image img {
      bottom: -20%;
      }
      }
      .hogwarts__image span {
      font-style: italic;
      max-width: 110px;
      position: absolute;
      top: 7%;
      left: 18%;
      font-size: 22px;
      line-height: 0.9;
      transform: rotate(-5deg);
      }
      
      .terrarium {
      margin: 1.5rem 0;
      }
      @media (min-width: 700px) {
      .terrarium {
      margin: 0 0 1.5rem;
      }
      }
      .terrarium figure {
      height: 100%;
      }
      .terrarium img {
      height: 96%;
      object-fit: cover;
      object-position: right;
      }
      
      .pie {
      line-height: 0;
      color: var(--gray);
      text-align: left;
      }
      .pie__image {
      margin: 0;
      border: 0;
      max-height: 15rem;
      object-fit: cover;
      }
      .pie__subtitle {
      background: #999;
      text-transform: uppercase;
      line-height: 1;
      padding: 0.4rem 1rem;
      font: 14px var(--font-sans-serif);
      color: var(--gray);
      }
      .pie__content {
      background: #666;
      padding: 1rem 1rem 1.2rem;
      color: var(--gray);
      }
      .pie__content p {
      margin-top: 0.5rem;
      }
      
      .sidebar-item {
      margin: 2rem 0;
      padding: 2rem 0 0;
      }
      .sidebar-item h5 {
      text-align: center;
      width: 100%;
      padding: 0.5rem;
      margin: auto;
      }
      .sidebar-item p {
      margin-top: 1rem;
      }
      .sidebar-item:hover h5 {
      transition: 0.3s ease;
      background: var(--black);
      color: #fff;
      }
      
      .item-with-image {
      margin-top: 1.5rem;
      }
      .item-with-image h4 {
      font-size: 24px;
      text-align: left;
      margin-bottom: 0.5rem;
      transition: 0.2s ease;
      }
      @media (min-width: 700px) {
      .item-with-image {
      margin: 0;
      }
      }
      .item-with-image:not(.cssgrid-collection):hover h4 {
      color: white !important;
      background: var(--black);
      }
      .magazine {
      border: 1px solid;
      border-width: 1px 0;
      padding-bottom: 1rem;
      }
      
      .menu {
      margin: 1.5rem 0;
      }
      @media (min-width: 1024px) {
      .menu {
      margin: 0;
      }
      }
      .menu figure {
      height: 100%;
      }
      .menu img {
      height: 90%;
      object-fit: cover;
      object-position: left;
      }
      
      .cssgrid-collection {
      display: flex;
      align-content: stretch;
      border-top: 1px solid;
      padding-top: 1rem;
      }
      .cssgrid-collection h4 {
      margin: 0 0 0.8rem;
      }
      .cssgrid-collection__image {
      flex: 0 0 32%;
      margin-right: 1.5rem;
      }
      .cssgrid-collection img {
      height: 100%;
      object-fit: cover;
      object-position: left;
      }
      .cssgrid-collection p a {
      border-bottom: 1px dashed;
      }
      .cssgrid-collection p a:hover {
      border-bottom: 1px solid;
      }
      
      @media (min-width: 1024px) {
      .captcha {
      margin-top: 0;
      }
      }
      
      .workout {
      border: 2px solid transparent;
      outline: 3px solid var(--black);
      box-shadow: inset 0 0 0 1px var(--black);
      width: calc(100% - 4px);
      margin: 3rem auto 0.2rem;
      }
      .workout__image {
      padding: 2px;
      }
      .workout__image img {
      height: 16rem;
      object-fit: cover;
      object-position: left;
      border: none;
      }
      @media (min-width: 1024px) {
      .workout__image img {
      height: 25rem;
      }
      }
      .workout__blurb {
      font: 22px/1.1 var(--font-sans-serif);
      text-align: center;
      padding: 0.5rem;
      color: var(--black);
      margin: -1rem 0.5rem 0.3rem;
      }
      .workout__title {
      font: 18px/1.1 var(--font-sans-serif);
      text-transform: uppercase;
      text-align: center;
      padding: 1rem;
      background: var(--black);
      color: var(--gray);
      transition: 0.2s ease;
      }
      
      .social {
      display: grid;
      grid-template-columns: 1fr 3fr;
      grid-template-rows: max-content auto;
      color: var(--gray);
      text-align: left;
      }
      .social__image {
      margin: 0;
      border: 0;
      grid-row: span 2;
      height: 100%;
      object-fit: cover;
      }
      .social__subtitle {
      background: #999;
      text-transform: uppercase;
      line-height: 1;
      padding: 0.4rem 1rem;
      color: var(--gray);
      font: 14px var(--font-sans-serif);
      }
      .social__content {
      background: #666;
      padding: 1rem;
      color: var(--gray);
      grid-column: 2;
      }
      
      .plan {
      padding-bottom: 1rem;
      }
      @media (min-width: 700px) and (max-width: 1024px) {
      .plan {
      grid-column: span 3;
      margin: 0 0 1.5rem;
      }
      }
      @media (min-width: 1024px) {
      .plan {
      border-bottom: 1px solid;
      }
      }
      
      .pie:hover img,
      .social:hover img,
      .menu:hover img,
      .terrarium:hover img,
      .plan:hover img,
      .toggles:hover img,
      .workout:hover img,
      .cssgrid-collection__image:hover img {
      filter: grayscale(0);
      }
      
      .workout:hover .workout__title {
      background: transparent;
      color: var(--black);
      }
      
      .hogwarts:hover .hogwarts__title {
      background: transparent;
      color: var(--black);      }

   </style>

"""
# keep going 

