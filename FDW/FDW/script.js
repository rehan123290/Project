document.getElementById('orderNowBtn').addEventListener('click', function() {
    document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function() {
        alert('Browse our featured restaurants and place your order!');
    }, 800);
}); 