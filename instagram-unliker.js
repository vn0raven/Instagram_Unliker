/**
 * Instagram Like Remover - Clean & Fast Edition
 * Includes Smart Wait, X-Ray Recovery, and increased Batch Size (50).
 */

;(async function () {
  // --- SETTINGS ---
  const BATCH_SIZE = 50
  const MIN_SAFETY_WAIT = 4000 
  const SCROLL_ATTEMPTS = 5

  // --- HELPERS ---
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

  // --- LOADING DETECTOR ---
  const waitForLoadingGone = async () => {
    console.log('Checking for loading spinner...')
    
    const maxWaitTime = 20000 
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
        const spinner = document.querySelector('[role="progressbar"], svg[aria-label="Loading..."], [aria-label="Loading..."]')
        const deletingText = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText === 'Deleting...' || el.innerText === 'Loading...')
        
        if (!spinner && !deletingText) {
            await randomDelay(1000, 2000)
            return
        }
        
        console.log('Instagram is still processing... Waiting...')
        await randomDelay(1000, 1500)
    }
    console.log('Wait timed out. Forcing next step.')
  }

  // --- X-RAY FINDER ---
  const findButtonXRay = (textOptions) => {
    const lowerTexts = textOptions.map(t => t.toLowerCase())
    const allElements = document.querySelectorAll('button, div, span, a, p')
    for (const el of allElements) {
      const txt = el.innerText ? el.innerText.trim().toLowerCase() : ''
      if (lowerTexts.some(t => txt === t)) {
         return el
      }
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

  const hardScrollTop = async () => {
    console.log('Scrolling to TOP to find buttons...')
    window.scrollTo(0, 0)
    await randomDelay(2000, 3000)
  }

  const loadMoreItems = async () => {
    console.log('Scrolling down to find more items...')
    window.scrollTo(0, document.body.scrollHeight)
    await randomDelay(2000, 3000)
    window.scrollBy(0, -300) 
    await randomDelay(1000, 1500)
    window.scrollTo(0, document.body.scrollHeight)
    await randomDelay(3000, 4000)
  }

  console.log('Script started. Waiting 3 seconds...')
  await randomDelay(3000, 3000)

  // --- MAIN LOOP ---
  while (true) {
    try {
      // 1. Check for "Cancel" to reset stuck state
      const cancelBtn = findButtonXRay(['Cancel', 'Abbrechen'])
      if (cancelBtn) {
          console.log('Found Cancel button. Resetting selection...')
          simulateClick(cancelBtn)
          await randomDelay(2000, 3000)
      }

      // 2. Find "Select"
      let selectBtn = findButtonXRay(['Select', 'Selec.'])
      
      if (!selectBtn) {
           console.log('Select button missing. Scrolling UP...')
           await hardScrollTop()
           selectBtn = findButtonXRay(['Select', 'Selec.'])
           
           if (!selectBtn) {
               console.log('Select truly missing. Checking checkboxes...')
               const anyChecks = document.querySelectorAll('[aria-label="Toggle checkbox"]')
               if (anyChecks.length === 0) {
                   console.log('No Select button and no checkboxes. Stopping.')
                   break
               }
           }
      }

      if (selectBtn) {
          simulateClick(selectBtn)
          console.log('Clicked Select.')
          await randomDelay(1500, 2500)
      }

      // 3. Select Items
      let checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]')
      
      if (checkboxes.length === 0) {
        let attempts = 0
        while (checkboxes.length === 0 && attempts < SCROLL_ATTEMPTS) {
          await loadMoreItems()
          checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]')
          attempts++
        }
      }

      if (checkboxes.length === 0) {
        console.log('No more items found. Job done.')
        break
      }

      console.log(`Found ${checkboxes.length} items. Selecting ${BATCH_SIZE}...`)
      let count = 0
      for (const cb of checkboxes) {
        if (count >= BATCH_SIZE) break
        simulateClick(cb)
        count++
        await randomDelay(150, 250)
      }

      // 4. Footer "Unlike"
      await randomDelay(1000, 2000)
      const unlikeFooter = findRedAction()

      if (unlikeFooter) {
        console.log('Clicking footer action...')
        simulateClick(unlikeFooter)

        // 5. Popup Confirmation
        console.log('Waiting for popup...')
        await randomDelay(2000, 3000)

        const confirmBtn = findRedAction() 

        if (confirmBtn && confirmBtn !== unlikeFooter) {
          console.log('Confirmed in popup.')
          simulateClick(confirmBtn)
          
          console.log('Waiting for process to finish...')
          await waitForLoadingGone()
          
          console.log('Loading finished. Cooling down...')
          await randomDelay(MIN_SAFETY_WAIT, MIN_SAFETY_WAIT + 2000)

        } else {
          console.log('Popup button vague. Clicking generic Unlike...')
          if (confirmBtn) simulateClick(confirmBtn)
          await waitForLoadingGone()
          await randomDelay(MIN_SAFETY_WAIT, MIN_SAFETY_WAIT + 2000)
        }

      } else {
        console.log('Footer button missing. Retrying loop...')
        continue 
      }

    } catch (e) {
      console.error('Fatal Error:', e)
      break
    }
  }
  console.log('Process finished.')
})()