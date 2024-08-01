document.getElementById('openCalendly').addEventListener('click', function () {
    document.getElementById('calendlyContainer').style.display = 'block';
    Calendly.initInlineWidget({
        url: 'https://calendly.com/ramysolh93/y-swipe',
        parentElement: document.getElementById('calendlyContainer'),
        prefill: {},
        utm: {},
        onEventScheduled: function(event) {
            // Save the scheduled time in local storage for simplicity
            const scheduledTimes = JSON.parse(localStorage.getItem('scheduledTimes')) || [];
            scheduledTimes.push(event.data.payload.event.start_time);
            localStorage.setItem('scheduledTimes', JSON.stringify(scheduledTimes));
            alert('Time selected: ' + event.data.payload.event.start_time);
        }
    });
});