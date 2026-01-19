const API_URL = "http://127.0.0.1:8000";

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

async function loadData() {
    const tbody = document.getElementById("data");
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading data...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/admin/registrations`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        renderTable(data);
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--error-color);">Error loading data.</td></tr>';
        console.error('Error:', error);
    }
}

function renderTable(data) {
    const tbody = document.getElementById("data");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No registrations found.</td></tr>';
        return;
    }

    data.forEach(user => {
        let statusBadgeClass = 'badge-pending';
        if (user.status === 'Accepted') statusBadgeClass = 'badge-accepted';
        if (user.status === 'Rejected') statusBadgeClass = 'badge-rejected';

        tbody.innerHTML += `
            <tr>
                <td>#${user.id}</td>
                <td>
                    <div style="font-weight: 500; cursor: pointer; color: var(--primary-color);" 
                         onclick="showDetails('${user.full_name}', '${user.email}', '${user.reason}', '${user.benefits}')">
                        ${user.full_name} <i class="fas fa-info-circle" style="font-size: 0.8rem;"></i>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${user.email}</div>
                </td>
                <td>${user.program || '-'}</td>
                <td>${user.age || '-'}</td>
                <td>${user.date_field || '-'}</td>
                <td>${user.course}</td>
                <td><span class="badge ${statusBadgeClass}">${user.status}</span></td>
                <td>
                    <button class="action-btn btn-approve" onclick="updateStatus(${user.id}, 'approve')" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn btn-reject" onclick="updateStatus(${user.id}, 'reject')" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Helper to show Full Details
window.showDetails = (name, email, reason, benefits) => {
    // Basic cleanup for undefined values
    if (reason === 'undefined' || reason === 'null') reason = 'No reason provided';
    if (benefits === 'undefined' || benefits === 'null') benefits = 'No benefits provided';

    alert(`
Student Details:
----------------
Name: ${name}
Email: ${email}

Why they chose this course:
${reason}

How it helps them:
${benefits}
    `);
};

async function updateStatus(id, action) {
    try {
        const response = await fetch(`${API_URL}/admin/${action}/${id}`, {
            method: "POST"
        });

        if (response.ok) {
            loadData(); // Reload table
        } else {
            alert("Failed to update status");
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/delete/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            loadData();
        } else {
            alert("Failed to delete user");
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

async function exportToExcel() {
    try {
        const response = await fetch(`${API_URL}/admin/registrations`);
        const data = await response.json();

        if (data.length === 0) {
            alert("No data to export");
            return;
        }

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Full Name,Email,Program,Age,Date of Birth,Course,Reason,Benefits,Status\n";

        // CSV Rows
        data.forEach(row => {
            const clean = (text) => (text || "").toString().replace(/,/g, " ").replace(/\n/g, " ");

            csvContent += `${row.id},${clean(row.full_name)},${clean(row.email)},${clean(row.program)},${row.age},${row.date_field},${clean(row.course)},${clean(row.reason)},${clean(row.benefits)},${row.status}\n`;
        });

        // Download Trigger
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "registrations_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export data");
    }
}
