class SchedulingManager {
  constructor() {
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3001' 
      : '';
    this.schedules = [];
    this.selectedDate = new Date();
    this.init();
  } 
  
  async init() {
    // Check authentication
    if (!window.authManager?.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    await this.loadSchedules();
    this.bindEvents();
    this.renderCalendar();
  }

  async loadSchedules() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/schelduing`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        this.schedules = await response.json();
        this.renderSchedules();
      } else {
        console.error('Failed to load schedules:', response.status);
      }
    } catch (error) {
      console.error('Load schedules error:', error);
      this.showError('Failed to load schedules');
    }
  }

  async createSchedule(scheduleData) {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/schelduing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        const newSchedule = await response.json();
        this.schedules.push(newSchedule);
        this.renderSchedules();
        this.showSuccess('Schedule created successfully!');
        return newSchedule;
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (error) {
      console.error('Create schedule error:', error);
      this.showError('Failed to create schedule');
    }
  }

  async updateSchedule(id, scheduleData) {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/schelduing/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        const updatedSchedule = await response.json();
        const index = this.schedules.findIndex(s => s.id === id);
        if (index !== -1) {
          this.schedules[index] = updatedSchedule;
        }
        this.renderSchedules();
        this.showSuccess('Schedule updated successfully!');
        return updatedSchedule;
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (error) {
      console.error('Update schedule error:', error);
      this.showError('Failed to update schedule');
    }
  }

  async deleteSchedule(id) {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/schelduing/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        this.schedules = this.schedules.filter(s => s.id !== id);
        this.renderSchedules();
        this.showSuccess('Schedule deleted successfully!');
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Delete schedule error:', error);
      this.showError('Failed to delete schedule');
    }
  }

  renderSchedules() {
    const container = document.getElementById('schedulesContainer');
    if (!container) return;

    if (this.schedules.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-calendar-plus fs-1 text-muted mb-3"></i>
          <h5>No schedules yet</h5>
          <p class="text-muted">Create your first outfit schedule</p>
          <button class="btn btn-primary" onclick="window.schedulingManager.openCreateModal()">
            <i class="bi bi-plus-circle me-1"></i>Create Schedule
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.schedules.map(schedule => this.createScheduleCard(schedule)).join('');
  }

  createScheduleCard(schedule) {
    const isActive = schedule.isActive ? 'active' : '';
    const nextDate = schedule.nextOccurrence ? new Date(schedule.nextOccurrence).toLocaleDateString() : 'N/A';
    
    return `
      <div class="col-md-6 col-lg-4">
        <div class="card schedule-card ${isActive}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title">${schedule.name}</h6>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" onclick="window.schedulingManager.editSchedule(${schedule.id})">
                    <i class="bi bi-pencil me-2"></i>Edit
                  </a></li>
                  <li><a class="dropdown-item" href="#" onclick="window.schedulingManager.toggleSchedule(${schedule.id})">
                    <i class="bi bi-${schedule.isActive ? 'pause' : 'play'} me-2"></i>${schedule.isActive ? 'Pause' : 'Resume'}
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" onclick="window.schedulingManager.deleteSchedule(${schedule.id})">
                    <i class="bi bi-trash me-2"></i>Delete
                  </a></li>
                </ul>
              </div>
            </div>
            
            <p class="card-text text-muted">${schedule.description || 'No description'}</p>
            
            <div class="schedule-details">
              <div class="mb-2">
                <small class="text-muted">Outfit:</small>
                <span class="ms-1">${schedule.outfit?.name || 'Not assigned'}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted">Recurrence:</small>
                <span class="ms-1 badge bg-light text-dark">${schedule.recurrenceType}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted">Next:</small>
                <span class="ms-1">${nextDate}</span>
              </div>
            </div>
            
            <div class="schedule-status mt-3">
              <span class="badge ${schedule.isActive ? 'bg-success' : 'bg-secondary'}">
                ${schedule.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCalendar() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;

    // Simple calendar implementation
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = `
      <div class="calendar-header mb-3">
        <h5>${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h5>
      </div>
      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="calendar-days">
    `;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const hasSchedule = this.schedules.some(s => s.scheduledDates?.includes(dateStr));
      const isToday = day === today.getDate();
      
      calendarHTML += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${hasSchedule ? 'has-schedule' : ''}" 
             data-date="${dateStr}" onclick="window.schedulingManager.selectDate('${dateStr}')">
          ${day}
          ${hasSchedule ? '<span class="schedule-indicator"></span>' : ''}
        </div>
      `;
    }

    calendarHTML += '</div></div>';
    calendarContainer.innerHTML = calendarHTML;
  }

  selectDate(dateStr) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
      day.classList.remove('selected');
    });
    
    // Add selection to clicked date
    document.querySelector(`[data-date="${dateStr}"]`).classList.add('selected');
    
    // Show schedules for selected date
    this.showSchedulesForDate(dateStr);
  }

  showSchedulesForDate(dateStr) {
    const daySchedules = this.schedules.filter(s => 
      s.scheduledDates?.includes(dateStr) || this.isScheduledForDate(s, dateStr)
    );

    const dayContainer = document.getElementById('daySchedulesContainer');
    if (!dayContainer) return;

    if (daySchedules.length === 0) {
      dayContainer.innerHTML = `
        <div class="text-center py-3">
          <p class="text-muted">No schedules for ${new Date(dateStr).toLocaleDateString()}</p>
          <button class="btn btn-sm btn-outline-primary" onclick="window.schedulingManager.openCreateModal('${dateStr}')">
            Add Schedule
          </button>
        </div>
      `;
      return;
    }

    dayContainer.innerHTML = `
      <h6>Schedules for ${new Date(dateStr).toLocaleDateString()}</h6>
      <div class="list-group">
        ${daySchedules.map(schedule => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">${schedule.name}</h6>
                <p class="mb-1 text-muted">${schedule.outfit?.name || 'No outfit'}</p>
              </div>
              <span class="badge bg-primary">${schedule.scheduledTime || 'All day'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  isScheduledForDate(schedule, dateStr) {
    // Check if recurring schedule applies to this date
    const date = new Date(dateStr);
    const startDate = new Date(schedule.startDate);
    
    if (date < startDate) return false;
    
    switch (schedule.recurrenceType) {
      case 'daily':
        return true;
      case 'weekly':
        return date.getDay() === startDate.getDay();
      case 'monthly':
        return date.getDate() === startDate.getDate();
      default:
        return false;
    }
  }

  openCreateModal(selectedDate = null) {
    const modal = document.getElementById('createScheduleModal');
    if (!modal) {
      this.createScheduleModal();
    }
    
    if (selectedDate) {
      document.getElementById('scheduleDate').value = selectedDate;
    }
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  createScheduleModal() {
    const modalHTML = `
      <div class="modal fade" id="createScheduleModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Create Schedule</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="createScheduleForm">
                <div class="mb-3">
                  <label for="scheduleName" class="form-label">Schedule Name</label>
                  <input type="text" class="form-control" id="scheduleName" required>
                </div>
                <div class="mb-3">
                  <label for="scheduleDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="scheduleDescription" rows="2"></textarea>
                </div>
                <div class="mb-3">
                  <label for="scheduleOutfit" class="form-label">Outfit</label>
                  <select class="form-control" id="scheduleOutfit">
                    <option value="">Select outfit...</option>
                  </select>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="scheduleDate" class="form-label">Start Date</label>
                      <input type="date" class="form-control" id="scheduleDate" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="scheduleTime" class="form-label">Time</label>
                      <input type="time" class="form-control" id="scheduleTime">
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="recurrenceType" class="form-label">Recurrence</label>
                  <select class="form-control" id="recurrenceType">
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="window.schedulingManager.saveSchedule()">Save Schedule</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  async saveSchedule() {
    const form = document.getElementById('createScheduleForm');
    const formData = new FormData(form);
    
    const scheduleData = {
      name: document.getElementById('scheduleName').value,
      description: document.getElementById('scheduleDescription').value,
      outfitId: document.getElementById('scheduleOutfit').value || null,
      startDate: document.getElementById('scheduleDate').value,
      scheduledTime: document.getElementById('scheduleTime').value,
      recurrenceType: document.getElementById('recurrenceType').value,
      isActive: true
    };

    await this.createSchedule(scheduleData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('createScheduleModal'));
    modal.hide();
    
    // Reset form
    form.reset();
  }

  async editSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (!schedule) return;

    // Populate form with existing data
    document.getElementById('scheduleName').value = schedule.name;
    document.getElementById('scheduleDescription').value = schedule.description || '';
    document.getElementById('scheduleOutfit').value = schedule.outfitId || '';
    document.getElementById('scheduleDate').value = schedule.startDate.split('T')[0];
    document.getElementById('scheduleTime').value = schedule.scheduledTime || '';
    document.getElementById('recurrenceType').value = schedule.recurrenceType;

    // Change modal title and save button
    document.querySelector('#createScheduleModal .modal-title').textContent = 'Edit Schedule';
    document.querySelector('#createScheduleModal .btn-primary').onclick = () => this.updateScheduleFromForm(id);

    const modal = new bootstrap.Modal(document.getElementById('createScheduleModal'));
    modal.show();
  }

  async updateScheduleFromForm(id) {
    const scheduleData = {
      name: document.getElementById('scheduleName').value,
      description: document.getElementById('scheduleDescription').value,
      outfitId: document.getElementById('scheduleOutfit').value || null,
      startDate: document.getElementById('scheduleDate').value,
      scheduledTime: document.getElementById('scheduleTime').value,
      recurrenceType: document.getElementById('recurrenceType').value
    };

    await this.updateSchedule(id, scheduleData);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('createScheduleModal'));
    modal.hide();
  }

  async toggleSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (!schedule) return;

    await this.updateSchedule(id, { isActive: !schedule.isActive });
  }

  bindEvents() {
    // Add schedule button
    const addBtn = document.getElementById('addScheduleBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openCreateModal());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshSchedules');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadSchedules());
    }
  }

  showError(message) {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }

  showSuccess(message) {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show">
          <i class="bi bi-check-circle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.schedulingManager = new SchedulingManager();
});