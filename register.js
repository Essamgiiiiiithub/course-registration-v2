document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const resultEl = document.getElementById('result');

    // UI Helpers
    const setLoading = (isLoading) => {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    };

    const showMessage = (type, text) => {
        // Reset styles first
        resultEl.style.display = 'block';
        resultEl.style.marginTop = '20px';
        resultEl.style.padding = '15px';
        resultEl.style.borderRadius = '10px';
        resultEl.style.textAlign = 'center';

        if (type === 'success') {
            resultEl.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            resultEl.style.color = '#10b981';
            resultEl.style.border = '1px solid #10b981';
            resultEl.innerHTML = `<i class="fas fa-check-circle"></i> <strong>${text}</strong>`;
        } else {
            resultEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            resultEl.style.color = '#ef4444';
            resultEl.style.border = '1px solid #ef4444';
            resultEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> <strong>${text}</strong>`;
        }
    };

    // Form Submission
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Validation
        const fullName = document.getElementById('full_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const course = document.getElementById('course').value;
        const program = document.getElementById('program').value.trim();
        const age = document.getElementById('age').value;
        const date_field = document.getElementById('date_field').value;
        const reason = document.getElementById('reason').value.trim();
        const benefits = document.getElementById('benefits').value.trim();

        if (!fullName || !email || !course || !program || !age || !date_field || !reason || !benefits) {
            showMessage('error', 'Please fill in all fields correctly.');
            return;
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        resultEl.style.display = 'none'; // Hide previous messages

        const data = {
            full_name: fullName,
            email: email,
            course: course,
            program: program,
            age: parseInt(age),
            date_field: date_field,
            reason: reason,
            benefits: benefits
        };

        try {
            // Updated URL to point to the backend relative or absolute
            // In dev, it might be localhost:8000, assuming we are serving from there or CORS is set.
            const response = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Show inline success message
                showMessage('success', '✅ Registration Successful! Please check your email.');
                form.reset();
            } else {
                // Show inline error message
                showMessage('error', result.detail || "Registration failed. Please try again.");
            }

        } catch (error) {
            console.error('Submission Error:', error);
            showMessage('error', "Server connection error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    });

    // Add float label interactions if needed, but CSS handles focus mostly.
});
