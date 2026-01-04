/**
 * Instagram Like Remover - "Heavy Duty 100" 
 * 1. Batch Size: 100 (Aggressive).
 * 2. Scroller: Universal Brute-Force (Scrolls entire page structure).
 * 3. Crash Recovery: Ignores stuck spinners to prevent freezing.
 */

;(async function () {
  // --- SETTINGS ---
  const BATCH_SIZE = 100
  const SAFETY_WAIT_MIN = 12000 
  const SAFETY_WAIT_MAX = 15000
  const MAX_SCROLL_ATTEMPTS = 20

  const randomDelay = (min, max) => {
    const time = Math.floor(Math.random() * (max - min + 1) + min)
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  const simulateClick = (element) => {
    const eventOptions = { bubbles: true, cancelable: true, view: window, buttons: 1 }
    element.dispatchEvent(new MouseEvent('mousedown', eventOptions))
    element.dispatchEvent(new MouseEvent('mouseup', eventOptions))
    element.dispatchEvent(new MouseEvent('click', eventOptions))
  }

  // --- CRASH-PROOF LOADING CHECK ---
  const waitForLoadingGone = async () => {
    console.log('Checking for loading spinner...')
    
    // Timeout set to 20s. If it takes longer, we assume a crash and move on.
    const maxWaitTime = 20000 
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
        const spinner = document.querySelector('[role="progressbar"], svg[aria-label="Loading..."], [aria-label="Loading..."]')
        const deletingText = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText === 'Deleting...' || el.innerText === 'Loading...')
        
        if (!spinner && !deletingText) {
            await randomDelay(1000, 2000)
            return
        }
        await randomDelay(1000, 1500)
    }
    console.log('Spinner stuck (Server Crash?). Ignoring and forcing next batch.')
  }

  const findButtonXRay = (textOptions) => {
    const lowerTexts = textOptions.map(t => t.toLowerCase())
    const allElements = document.querySelectorAll('button, div, span, a, p')
    for (const el of allElements) {
      const txt = el.innerText ? el.innerText.trim().toLowerCase() : ''
      if (lowerTexts.some(t => txt === t)) return el
    }
    return null
  }

  const findRedAction = () => {
    const spans = document.querySelectorAll('span, div, button')
    const targets = ['unlike', 'delete', 'gefällt mir nicht mehr']
    for (let i = spans.length - 1; i >= 0; i--) {
        const el = spans[i]
        const txt = el.innerText ? el.innerText.trim().toLowerCase() : ''
        if (targets.includes(txt)) return el
    }
    return null
  }

  // --- BRUTE FORCE SCROLLER ---
  const scrollEverything = async () => {
    console.log('Force Scrolling everything...')
    const targets = [window, document.documentElement, document.body, document.querySelector('main')]
    const allDivs = document.querySelectorAll('div')
    for (const div of allDivs) {
        // Collect any div that is actually scrollable
        if (div.scrollHeight > div.clientHeight + 50) targets.push(div)
    }

    // Scroll Down
    for (const t of targets) { if(t && t.scrollTo) t.scrollTo(0, t.scrollHeight || 100000) }
    await randomDelay(1000, 1500)
    
    // Bounce Up
    for (const t of targets) { if(t && t.scrollBy) t.scrollBy(0, -300) }
    await randomDelay(1000, 1500)
    
    // Scroll Down Again
    for (const t of targets) { if(t && t.scrollTo) t.scrollTo(0, t.scrollHeight || 100000) }
    await randomDelay(2000, 3000)
  }

  console.log('Heavy Duty 100 Script started...')
  await randomDelay(3000, 3000)

  while (true) {
    try {
      // 1. Recover from Stuck State
      const cancelBtn = findButtonXRay(['Cancel', 'Abbrechen'])
      if (cancelBtn) {
          console.log('Resetting "Cancel" state...')
          simulateClick(cancelBtn)
          await randomDelay(2000, 3000)
      }

      // 2. Find Select
      let selectBtn = findButtonXRay(['Select', 'Selec.'])
      if (!selectBtn) {
           console.log('Select button missing. Resetting UI...')
           window.scrollTo(0, 0)
           await randomDelay(2000, 3000)
           selectBtn = findButtonXRay(['Select', 'Selec.'])
           if (!selectBtn) break
      }

      simulateClick(selectBtn)
      console.log('Clicked Select.')
      await randomDelay(1500, 2500)

      // 3. Populate List (Target: 100)
      let checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]')
      let scrollAttempts = 0
      
      while (checkboxes.length < BATCH_SIZE && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
          console.log(`Found ${checkboxes.length} items. Need ${BATCH_SIZE}. Scrolling...`)
          await scrollEverything()
          checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]')
          scrollAttempts++
      }

      if (checkboxes.length === 0) {
        console.log('No items found. Job done.')
        break
      }

      // 4. Select 100 Items
      console.log(`Selecting ${BATCH_SIZE} items...`)
      let count = 0
      for (const cb of checkboxes) {
        if (count >= BATCH_SIZE) break
        simulateClick(cb)
        count++
        await randomDelay(80, 150) // Fast clicks
      }

      // 5. Delete
      await randomDelay(1000, 2000)
      const unlikeFooter = findRedAction()

      if (unlikeFooter) {
        simulateClick(unlikeFooter)
        await randomDelay(2000, 3000)
        const confirmBtn = findRedAction() 

        if (confirmBtn && confirmBtn !== unlikeFooter) {
          console.log('Confirmed. Deleting...')
          simulateClick(confirmBtn)
          
          await waitForLoadingGone()
          
          console.log('Cooling down...')
          await randomDelay(SAFETY_WAIT_MIN, SAFETY_WAIT_MAX)
        } else {
           if (confirmBtn) simulateClick(confirmBtn)
           await waitForLoadingGone()
           await randomDelay(SAFETY_WAIT_MIN, SAFETY_WAIT_MAX)
        }
      } else {
        console.log('Footer missing. Retrying...')
        continue 
      }

    } catch (e) {
      console.error('Fatal Error:', e)
      break
    }
  }
  console.log('Process finished.')
})()