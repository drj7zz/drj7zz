export default async function run(page, ui) {
  // Login as admin
  await page.goto('http://localhost:3000/admin/login');
  await page.waitForTimeout(500);

  const snapLogin = await ui.snapshot();
  const uBox = snapLogin.match(/@(e\d+) textbox "(?:e\.g\. )?giridirghraj"/i)?.[1] || snapLogin.match(/@(e\d+) textbox "[^"]*user[^"]*"/i)?.[1] || snapLogin.match(/@(e\d+) textbox/i)?.[1];
  const pBox = snapLogin.match(/@(e\d+) textbox "[•\*]+"/i)?.[1] || snapLogin.match(/@(e\d+) textbox "[^"]*pass[^"]*"/i)?.[1];
  const loginBtn = snapLogin.match(/@(e\d+) button "Enter Dashboard"/i)?.[1] || snapLogin.match(/@(e\d+) button "Sign In"/i)?.[1];

  if (!uBox || !pBox || !loginBtn) {
    return { error: 'Could not find admin login inputs', snapLogin };
  }

  await ui.fill(uBox, 'giridirghraj');
  await ui.fill(pBox, 'giridirghraj');
  await ui.click(loginBtn);
  await page.waitForTimeout(1000);

  // Now on Admin Dashboard. Switch to Chat Inbox tab
  const snapDash = await ui.snapshot();
  const inboxTab = snapDash.match(/@(e\d+) button "[^"]*Inbox[^"]*"/i)?.[1];
  if (!inboxTab) {
    return { error: 'Could not find Inbox tab', snapDash };
  }

  await ui.click(inboxTab);
  await page.waitForTimeout(500);

  // Click on the first thread
  const snapInbox = await ui.snapshot();
  const firstThread = snapInbox.match(/@(e\d+) button "[^"]*tester_[^"]*"/i)?.[1];
  if (!firstThread) {
    return { error: 'No thread button found in inbox', snapInbox };
  }

  await ui.click(firstThread);
  await page.waitForTimeout(400);

  // Thread is now open! Check for Close DM button
  const snapThreadOpen = await ui.snapshot();
  const closeDmBtn = snapThreadOpen.match(/@(e\d+) button "Close DM"/i)?.[1];

  let closeDmWorked = false;
  if (closeDmBtn) {
    await ui.click(closeDmBtn);
    await page.waitForTimeout(400);

    const snapThreadClosed = await ui.snapshot();
    // After closing DM, the active thread chat head is gone and shows empty selection prompt
    const closeDmStillPresent = Boolean(snapThreadClosed.match(/@(e\d+) button "Close DM"/i)?.[1]);
    closeDmWorked = !closeDmStillPresent;
  }

  return {
    adminLogged: true,
    inboxLoaded: Boolean(inboxTab),
    firstThreadClicked: Boolean(firstThread),
    hasCloseDmInAdmin: Boolean(closeDmBtn),
    adminCloseDmWorked: closeDmWorked
  };
}
