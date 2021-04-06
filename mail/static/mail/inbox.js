document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').classList.add('col-sm-10');
  document.querySelector('#emails-view').classList.remove('col-sm-6');

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // show inbox mails
  if (mailbox === 'inbox') { // inbox page

    // header
    document.querySelector('#emails-view').innerHTML = `<h3>Inbox  <span class='lead'> (Read emails apear as grey)</span></h3>`;
    mails_from_api("/emails/inbox");
    document.querySelector('#emails-view').style.animationPlayState = 'running';

  } else if (mailbox === 'sent') { // sent emails
      mails_from_api("/emails/sent")

  } else if (mailbox === 'archive') { // archived mails
    mails_from_api("/emails/archive")
  }

}

// uses the api to display mails from given address
function mails_from_api(address) {

 fetch(address)
    .then(response => {return response.json()})
    .then(data => {
      for (let i = 0; i < data.length; i++) { // for each mail in the data
        display_mail(data, i, address);
      }
      
    });
    
}

function display_mail(data, i, address) {
  let div = document.createElement('div'); // wrapper div

  // load mail when user clicked
  div.addEventListener('click', function() {
    
    // mark this mail as read
    modifyRead(true, data[i]['id']);

    // repopulate #emails-view with the details of the mail
    view_mail(data[i], address);    
  });

  // grey background if unread
  if (data[i]['read']) {
    div.classList.add('read');
  }

  // css classes
  div.classList.add('darker', 'border-bottom', 'border-left', 'border-right',
   'border-info', 'p-2', 'row');
  
   // border top for the first mail
  if (i == 0) {
    div.classList.add('border-top');
  }

  // sender element
  let sender = classDiv('mx-2');
  sender.innerHTML = `<strong>${data[i]['sender']}</strong>`;

  // title element
  let title = classDiv('mx-2');
  title.innerHTML = `${data[i]['subject']}`;

  // timestamp element
  let timestamp = classDiv('mx-2', 'ml-auto')
  timestamp.innerHTML = `${data[i]['timestamp']}`;

  appendAll(div, sender, title, timestamp); // append info to wrapper div
  document.querySelector('#emails-view').appendChild(div);

}

function view_mail(mail, address) {
  // header and dimensions
  document.querySelector('#emails-view').innerHTML = `<h3>Details:</h3>`;
  document.querySelector('#emails-view').classList.remove('col-sm-10');
  document.querySelector('#emails-view').classList.add('col-sm-6');

  let wrapperDiv = classDiv('p-4', 'px-5', 'border', 'border-info');

  // info about this mail
  let from = document.createElement('p');
  from.innerHTML = `<strong>From: </strong> ${mail['sender']}`
  let subject = document.createElement('p');
  subject.innerHTML = `<strong>Subject:</strong> ${mail['subject']}`;
  let body = document.createElement('p');
  body.innerHTML = `<strong>Body:</strong> ${mail['body']}`
  body.classList.add('text-dark');
  let timestamp = document.createElement('p');
  timestamp.innerHTML = `<strong>Timestamp: </strong> ${mail['timestamp']}`;

  // recipients info
  let recipients_header = document.createElement('div');
  recipients_header.innerHTML = '<strong>Recipients:</strong>';
  let recipients_container = document.createElement('div');
  let recipients = mail['recipients'];
  for ( let i = 0; i < recipients.length; i++ ) {
    let recipient = classDiv('col', 'text-dark');
    recipient.innerHTML = recipients[i];
    recipients_container.append(recipient);
  }

  // wrapper for reply and archive buttons
  let actionButtons = classDiv('text-center');

  // reply button
  let reply = document.createElement('button');
  reply.classList.add('btn', 'btn-primary', 'mx-2');
  reply.innerHTML = 'Reply';
  reply.addEventListener('click', ()=> { replyButtonListener(mail)});
  actionButtons.append(reply);

  // unarchive button
  if ( mail['archived'] == true && address != '/emails/sent' ) {
    actionButtons.append(archiveUnarchiveButton('Unarchive mail', false, mail['id']));
  }

  // archive button
  if ( mail['archived'] == false ) {
    actionButtons.append(archiveUnarchiveButton('Archive mail', true, mail['id']));
  }

  appendAll(wrapperDiv, from, subject, body, timestamp, recipients_header,
    recipients_container, actionButtons);
  document.querySelector('#emails-view').append(wrapperDiv);

}

// loads compose mail with info pre-filled
replyButtonListener = function(mail) {
  compose_email();
  document.getElementById('compose-recipients').value = mail['sender'];
  if ( mail['subject'].startsWith('Re: ') ) {
    document.getElementById('compose-subject').value = mail['subject'];
  } else {
    document.getElementById('compose-subject').value = `Re: ${mail['subject']}`;
  }
  document.getElementById('compose-body').value = `on ${mail['timestamp']} ${mail['sender']} wrote:
   ${mail['body']}\n`;
}

// returns a button to serve as either archive or unarchive
function archiveUnarchiveButton(innerHTML, state, id) {
  let archiveUnarchiveButton = document.createElement('button');
    archiveUnarchiveButton.classList.add('btn', 'btn-primary');
    archiveUnarchiveButton.innerHTML = innerHTML
    archiveUnarchiveButton.addEventListener('click', function() {

      modify_archive(state, id);
      // redirect to inbox
      load_mailbox('inbox');
    });
    return archiveUnarchiveButton;
}

// appends all elements to given element
function appendAll(parent, ...children) {
  children.forEach( (child) => {
    parent.append(child);
  });
}
// returns a div with the given css classes applied
function classDiv(...classes) {
  let div = document.createElement('div');
  classes.forEach((cls) => {
    div.classList.add(cls);
  })
  
  return div;
}

// mark mail with given id as read/unread
function modifyRead(state, id) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: state
    })
  });
}

// mark mail with given id as archived/unarchived
function modify_archive(state, id) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: state
    })
  });
}