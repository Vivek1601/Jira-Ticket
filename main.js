let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue", "lightgreen", "black"]
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("jira_tickets")){
    // Retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketId);
    })
}

for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor
        })

        // console.log(filteredTickets)


        // Remove previous ticket
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }
        // Display new filtered tickets

        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        // Remove previous ticket
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }
        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
    })
}

// listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove('border');
        })
        colorElem.classList.add('border');
        modalPriorityColor = colorElem.classList[0];
    })

})

addBtn.addEventListener("click", (e) => {
    // Display modal
    // Generate ticket

    // Add flag, true -> Modal display
    // Add flag, true -> Modal None

    addFlag = !addFlag;
    if (addFlag) {
        modalCont.style.display = "flex";
    } else {
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})


modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === 'Shift') { //  we dont use enter bcoz then hume agr text area mai enter type krna ho we can't do it 
        createTicket(modalPriorityColor, textAreaCont.value);
        textAreaCont.value = "";
        setModalToDefault();
    }
})


function createTicket(ticketColor, ticketTask, ticketId) {
    let id = ticketId || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
            <div class="ticket-id">#${id}</div>
            <div class="task-area">${ticketTask}</div>
            <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i>
            </div>
    `;

    mainCont.appendChild(ticketCont);

    // create object of ticket and add to array
    if (!ticketId) {
        ticketsArr.push({ ticketColor, ticketTask, ticketId: id });
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
    }

    handleRemoval(ticketCont,id);
    handleLock(ticketCont,id);
    handleColor(ticketCont,id);
}

function handleRemoval(ticket,id) {
    // removeFlag -> true -> remove
    ticket.addEventListener("click",(e) => {
        if (removeFlag){

        let idx = getTicketIdx(id);
        // DB removal 
        ticketsArr.splice(idx,1);
        let strTicketArr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets",strTicketArr);

        ticket.remove(); // ui removal
        }
    })
}

function handleLock(ticketCount,id) {
    let ticketLock = ticketCount.children[3].children[0];
    // console.log(ticketCount.children[2])
    let ticketTaskArea = ticketCount.children[2]
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        } else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        // Modify data in localStorage (Ticket Task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
    })
}

function handleColor(ticket,id) {
    // let ticketColor = ticket.children[0];
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        // get ticket from tickets arr
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];
        // Get ticket color idx
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        })
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // Modify data in local storage (priority color change)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr)) 

    })
}

function getTicketIdx(id){
   let ticketIdx = ticketsArr.findIndex((ticketObj) => {
    return ticketObj.ticketId === id;
   })
   return ticketIdx;
}

//Setting the priority colors in modal to default as we have made the black on
//as the default one 
function setModalToDefault() {
    modalPriorityColor = colors[colors.length - 1];
    modalCont.style.display = "none";
    addFlag = false;
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    });
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}