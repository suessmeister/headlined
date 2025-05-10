// src/utils/newspaperHtml.ts
export const newspaperHtml = (headline: string, date: string, wallet_a: string, wallet_b: string, a_hits: number, b_hits: number) => `
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
               <div class="date">${date}</div>
               <div class="edition">BREAKING NEWS</div>
            </div>
         </aside>
         <h2 class="title--large main-title">${headline}</h2>
         <div class="main-text multi-column">

            <p>As the sun dipped behind the skyline, casting long shadows 
            across the twisted alleys of a cursed city, 
            two unknown snipers—${wallet_a.slice(0,4)}... and ${wallet_b.slice(0,4)}... stepped into the darkness. 
            Their rifles loaded, their minds set, they hunted through the eerie silence, knowing only one would leave the night victorious. </p>

            <p>The sniper, known for popping balloons midair with eerie precision, made quick work of the chaos in the city. With every step, ${wallet_a.slice(0, 4)}... landed headshot after headshot, clearing rooftops and alleys alike. Even a rogue balloon drifting across the skyline wasn’t spared. By the time ${wallet_b.slice(0, 4)}... could reload, the skyline was quiet. And ${wallet_a.slice(0, 4)}... had already claimed the final kill.</p>
            <p> "${wallet_a.slice(0, 4)}..., with conviction, claimed the lives of ${a_hits} enemies. ${wallet_b.slice(0, 4)}...
               was not too far behind, securing ${b_hits} enemy deaths. True heroes!!</p>
         </div><a class="terrarium" href="https://hpjf3wsvvyysupj6b2a3tb7zojxsvjwh6xmedqmqrny5wuzltbaa.arweave.net/O9Jd2lWuMSo9Pg6BuYf5cm8qpsf12EHBkItx21MrmEA" target="_blank">
            <figure><img src="https://hpjf3wsvvyysupj6b2a3tb7zojxsvjwh6xmedqmqrny5wuzltbaa.arweave.net/O9Jd2lWuMSo9Pg6BuYf5cm8qpsf12EHBkItx21MrmEA" />
               <figcaption> All that remains, for now, are ${a_hits + b_hits} coffins and ${a_hits + b_hits} tickets to hell. </figcaption>
            </figure>
         </a><a class="item-with-image plan span--2 long--2" href="https://kqjec6xeh7dlh7lwihmg6cgkmtewwqyas3xgwuz72g5ozff6bwia.arweave.net/VBJBeuQ_xrP9dkHYbwjKZMlrQwCW7mtTP9G67JS-DZA"
            target="_blank"><img src="https://kqjec6xeh7dlh7lwihmg6cgkmtewwqyas3xgwuz72g5ozff6bwia.arweave.net/VBJBeuQ_xrP9dkHYbwjKZMlrQwCW7mtTP9G67JS-DZA" />
            <h4>Are the gears of war inevitable? </h4>
            <div class="multi-column">
               <p>Enemy snipers, furious over their fallen comrades, are said to be regrouping. Some were spotted pacing rooftops, while others were seen crouched in dark alleyways, loading fresh rounds and whispering to one another. Their rage has continued to boil. But they’re not rushing in. This time, they’re watching from the shadows, waiting for the perfect opening. Word is, they’ve been drawing maps, building lookout posts, and sharpening their aim, all under the veil of a sunset that feels more like a warning than a view.
               </p>
            </div>
         </a><a class="hogwarts" target="_blank">
            <div class="hogwarts__title">Arm yourself now! Join the Fight for only 0.05 SOL! </div>
            <div class="hogwarts__image"> <span>Limited time offer</span><img
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-hogwarts.svg" /></div>
         </a><a class="item-with-image pasta with-border" href="https://codepen.io/oliviale/full/zYvxXWw" target="_blank">
            <h4>Windy Conditions</h4>
            <p> Upcoming forecasts are said to be moderately to extremely windy. Perhaps this will impact the performance
            of our noble fighters as their aim must adjust.</p>
         </a><a class="item-with-image magazine with-border" href="https://pacgptqrdgpvfjut5foxxnpsscekkkqdh4fwek6bdmnwwnhj4zja.arweave.net/eARnzhEZn1Kmk-lde7XykIilKgM_C2IrwRsbazTp5lI"
            target="_blank">
            <h4>2D Games in Web3</h4>
            <p>A tribute of sorts to simplistic web3 games. All games should be relatively easy to learn
            with a high potential for skill. Such games are fun! </p>
         </a><a class="item-with-image style" href="https://pacgptqrdgpvfjut5foxxnpsscekkkqdh4fwek6bdmnwwnhj4zja.arweave.net/eARnzhEZn1Kmk-lde7XykIilKgM_C2IrwRsbazTp5lI" target="_blank">
            <h4>Immigration</h4>
            <p>Rumors point to an influx of migrants. It seems like enemies have reduced their cities to ash.
               Intelligence claims that the majority of the immigrants it appears, are coming from Italy and France.
               With their introductions, we might be bracing for future city expansions! New landscape, new 
               architecture and new guns will arrive. We must defend what's left of our land together!</p>
         </a><a class="item-with-image toggles" href="https://codepen.io/oliviale/full/xxboXzo" target="_blank"><img
               src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/showcase-toggle.gif" />
            <h4>Solana Dev</h4>
            <p> More developers are joining Solana at record pace, even surpassing Ethereum! There's 
            never been a better time to build. Let's hope the builders don't get shot in-battle. </p>
         </a><a class="menu" href="https://pacgptqrdgpvfjut5foxxnpsscekkkqdh4fwek6bdmnwwnhj4zja.arweave.net/eARnzhEZn1Kmk-lde7XykIilKgM_C2IrwRsbazTp5lI" target="_blank">
            <figure><img src="https://pacgptqrdgpvfjut5foxxnpsscekkkqdh4fwek6bdmnwwnhj4zja.arweave.net/eARnzhEZn1Kmk-lde7XykIilKgM_C2IrwRsbazTp5lI" />
               <figcaption> Dawn is fast approaching. Will you be ready? </figcaption>
            </figure>
         </a><a class="social" href="https://qvuvpcl75kqrmwirlc66kjqd3oldtem5mpkxendlm67xkhitiwwa.arweave.net/hWlXiX_qoRZZEVi95SYD25Y5kZ1j1XI0a2e_dR0TRaw" tagrget="_blank"><img class="social__image"
               src="https://qvuvpcl75kqrmwirlc66kjqd3oldtem5mpkxendlm67xkhitiwwa.arweave.net/hWlXiX_qoRZZEVi95SYD25Y5kZ1j1XI0a2e_dR0TRaw" />
            <div class="social__subtitle">Keep Up With Us! </div>
            <div class="social__content"> Let us know what's up on X: @headlined.sol ... or say 
            hello to our student group -- @txblockchain ... go longhorns!! </div>
         </a>
        
         <div class="sidebar">
            <h3 class="title--big">Gun of the month</h3><a class="codepen-item pie"
               href="https://cjip3jrs54xrkonmjz3gv4yua4cqrvtb7mevjbzmlihmm5igaq3q.arweave.net/ElD9pjLvLxU5rE52avMUBwUI1mH7CVSHLFoOxnUGBDc" target="_blank"><img class="pie__image"
                  src="https://cjip3jrs54xrkonmjz3gv4yua4cqrvtb7mevjbzmlihmm5igaq3q.arweave.net/ElD9pjLvLxU5rE52avMUBwUI1mH7CVSHLFoOxnUGBDc" />
               <div class="pie__subtitle"> Barrett M82 </div>
               <div class="pie__content">
                  <h4>The People Voted!</h4>
                  <p> The .50 BMG was originally designed to disable radar stations. Its rounds punch through concrete walls. </p>
               </div>
            </a><a class="sidebar-item captcha" href="https://jqyzisdbpbqws7ektttydqoifqgpo47sdzwyl6v4qc4altmt3qaa.arweave.net/TDGUSGF4YWl8ipzngcHILAz3c_IebYX6vIC4Bc2T3AA" target="_blank">
               <h5>Future Gun Features</h5>
               <p> That reminds us! Some guns in the arsenal, starting early June will be visited by 
               a mysterious blacksmith. He claims to be able to provide X-ray vision as well as 
               other unique attributes to select new weapons. We'll see if he's able to follow through. </p>
            </a><a class="sidebar-item slack-ui with-border" href="https://jqyzisdbpbqws7ektttydqoifqgpo47sdzwyl6v4qc4altmt3qaa.arweave.net/TDGUSGF4YWl8ipzngcHILAz3c_IebYX6vIC4Bc2T3AA"
               target="_blank">
               <h5>Sniper matched with ex-girlfriend. </h5>
               <p> Let's just say shots were fired. And none towards enemy snipers. 
               Well, unless you consider them enemies. </p>
            </a><a class="workout" href="https://jqyzisdbpbqws7ektttydqoifqgpo47sdzwyl6v4qc4altmt3qaa.arweave.net/TDGUSGF4YWl8ipzngcHILAz3c_IebYX6vIC4Bc2T3AA" target="_blank">
               <div class="workout__image"><img
                     src="https://jqyzisdbpbqws7ektttydqoifqgpo47sdzwyl6v4qc4altmt3qaa.arweave.net/TDGUSGF4YWl8ipzngcHILAz3c_IebYX6vIC4Bc2T3AA" alt="Workout" /></div>
               <div class="workout__blurb"> Claim your player badges now! </div>
               <div class="workout__title"> Check The Arsenal! </div>
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
`;
