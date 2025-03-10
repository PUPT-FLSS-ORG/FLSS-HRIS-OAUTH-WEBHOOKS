import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../model/department.model';
import { Role } from '../../model/role.model'; // Import the Role model
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { trigger, transition, style, animate } from '@angular/animations'; // Import Angular animations
import { CollegeCampusService } from '../../services/college-campus.service';
import { CollegeCampus } from '../../model/college-campus.model';
import { AuthService } from '../../services/auth.service';
import { CampusContextService } from '../../services/campus-context.service'; // Add this import

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [ // Add animations for toast
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class NewAccountComponent implements OnInit {
  newAccountForm: FormGroup;
  toastVisible: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  departments: Department[] = []; // Array to store departments
  roles: Role[] = []; // Use the Role model here
  collegeCampuses: CollegeCampus[] = [];
  showCollegeCampus: boolean = false;
  adminRoleId: string = ''; // We'll set this in ngOnInit
  currentUserCollegeCampusID: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private departmentService: DepartmentService,
    private roleService: RoleService,
    private collegeCampusService: CollegeCampusService,
    private authService: AuthService,
    private campusContextService: CampusContextService
  ) {
    this.newAccountForm = this.fb.group({
      Fcode: ['', Validators.required],
      Surname: ['', Validators.required],
      FirstName: ['', Validators.required],
      MiddleName: [''],
      NameExtension: [''],
      Email: ['', [Validators.required, Validators.email]],
      EmploymentType: ['', Validators.required],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      Roles: [[], Validators.required], // Multi-select for roles
      DepartmentID: [{ value: '', disabled: true }],
      CollegeCampusID: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    console.log('NewAccountComponent initialized');
    this.loadRoles();
    this.loadCollegeCampuses();
  
    this.newAccountForm.get('Roles')?.valueChanges.subscribe((selectedRoles: string[]) => {
      this.handleRoleSelection(selectedRoles);
    });
  
    // Initial load of current user's college campus
    this.getCurrentUserCollegeCampus();
  
    // Subscribe to future campus changes
    this.campusContextService.getCampusId().subscribe(campusId => {
      console.log('Campus changed in NewAccountComponent:', campusId);
      if (campusId !== null && campusId !== this.currentUserCollegeCampusID) {
        this.currentUserCollegeCampusID = campusId;
        this.loadDepartments();
      }
    });

    // Add this new subscription
    this.newAccountForm.get('CollegeCampusID')?.valueChanges.subscribe((campusId) => {
      if (campusId) {
        this.loadDepartmentsForCampus(campusId);
      }
    });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        // Find the admin role and store its ID
        const adminRole = roles.find(role => role.RoleName.toLowerCase() === 'admin');
        if (adminRole) {
          this.adminRoleId = adminRole.RoleID.toString();
        }
      },
      error: error => console.error('Error fetching roles', error)
    });
  }

  loadDepartments(): void {
    console.log('Loading departments. Current user college campus ID:', this.currentUserCollegeCampusID);
    if (this.currentUserCollegeCampusID) {
      this.departmentService.getDepartments(this.currentUserCollegeCampusID).subscribe({
        next: departments => {
          console.log('Fetched departments:', departments);
          this.departments = departments;
          this.newAccountForm.get('DepartmentID')?.setValue('');
          if (departments.length === 0) {
            console.log('No departments found for this campus');
            // Remove the toast notification from here
          }
        },
        error: error => {
          console.error('Error fetching departments', error);
          // Remove the toast notification from here as well
        }
      });
    } else {
      console.log('No college campus ID available, skipping department load');
      this.departments = [];
    }
  }

  loadCollegeCampuses(): void {
    this.collegeCampusService.getCollegeCampuses().subscribe({
      next: campuses => this.collegeCampuses = campuses,
      error: error => console.error('Error fetching college campuses', error)
    });
  }

  // Handle role selection logic
  handleRoleSelection(selectedRoles: string[]): void {
    const departmentControl = this.newAccountForm.get('DepartmentID');
    const collegeCampusControl = this.newAccountForm.get('CollegeCampusID');

    const isStaffSelected = selectedRoles.includes(this.roles.find(r => r.RoleName.toLowerCase() === 'staff')?.RoleID?.toString() || '');
    const isAdminSelected = selectedRoles.includes(this.adminRoleId);

    if (isStaffSelected) {
      departmentControl?.disable();
      departmentControl?.setValue('');
    } else {
      departmentControl?.enable();
    }

    if (isAdminSelected) {
      this.showCollegeCampus = true;
      collegeCampusControl?.enable();
      collegeCampusControl?.setValidators(Validators.required);
      departmentControl?.enable(); // Enable department selection for admin
    } else {
      this.showCollegeCampus = false;
      collegeCampusControl?.disable();
      collegeCampusControl?.clearValidators();
      collegeCampusControl?.setValue('');
      
      // Reset department selection when admin is deselected
      departmentControl?.setValue('');
      this.departments = []; // Clear the departments array
      this.loadDepartments(); // Reload departments for the current user's campus
    }

    collegeCampusControl?.updateValueAndValidity();
    departmentControl?.updateValueAndValidity();
  }

  // Update selected roles when checkbox changes
  onRoleCheckboxChange(event: any): void {
    const selectedRoles = this.newAccountForm.get('Roles')?.value || [];
    const roleValue = event.target.value;

    if (event.target.checked) {
      selectedRoles.push(roleValue);
    } else {
      const index = selectedRoles.indexOf(roleValue);
      if (index > -1) {
        selectedRoles.splice(index, 1);
      }
    }
    this.newAccountForm.get('Roles')?.setValue(selectedRoles);
    this.handleRoleSelection(selectedRoles);
  }

  generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  onGeneratePasswordClick(): void {
    const generatedPassword = this.generatePassword();
    this.newAccountForm.get('Password')?.setValue(generatedPassword);
  }

  showToast(type: 'success' | 'error', message: string): void {
    // Reset first
    this.toastVisible = false;
    this.toastMessage = '';
    
    // Small delay before showing new toast
    setTimeout(() => {
      this.toastType = type;
      this.toastMessage = message;
      this.toastVisible = true;

      // Hide toast after 3 seconds
      setTimeout(() => {
        this.toastVisible = false;
        this.toastMessage = '';  // Clear the message when hiding
      }, 3000);
    }, 100);
  }

  onSubmit(): void {
    if (this.newAccountForm.valid) {
      const formData = this.newAccountForm.value;

      // Handle DepartmentID
      if (formData.Roles.includes(this.roles.find(r => r.RoleName.toLowerCase() === 'staff')?.RoleID)) {
        formData.DepartmentID = null;
      }

      // Handle CollegeCampusID
      if (!formData.Roles.includes(this.adminRoleId)) {
        formData.CollegeCampusID = this.currentUserCollegeCampusID;
      }

      this.userService.addUser(formData).subscribe({
        next: response => {
          this.showToast('success', 'Account created successfully');
          this.resetForm();
        },
        error: error => {
          console.log("Backend error details:", error);
          this.showToast('error', 'Error creating account');
        }
      });
    }
  }

  // Add this new method to reset the form
  resetForm(): void {
    this.newAccountForm.reset();
    this.newAccountForm.patchValue({
      EmploymentType: '',
      Roles: [],
      DepartmentID: { value: '', disabled: true },
      CollegeCampusID: { value: '', disabled: true }
    });
    this.showCollegeCampus = false;
    this.departments = [];
    this.loadDepartments();
  
    // Reset the checked state of role checkboxes
    this.roles.forEach(role => {
      const checkbox = document.querySelector(`input[type="checkbox"][value="${role.RoleID}"]`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    // Re-initialize form state based on roles
    this.handleRoleSelection([]);
  }

  getCurrentUserCollegeCampus(): void {
    this.campusContextService.getCampusId().subscribe(campusId => {
      if (campusId !== null) {
        console.log('Using campus ID from context:', campusId);
        this.currentUserCollegeCampusID = campusId;
        this.loadDepartments();
      } else {
        console.log('No campus ID in context, fetching from user details');
        const decodedToken = this.authService.getDecodedToken();
        if (decodedToken && decodedToken.userId) {
          this.userService.getUserById(decodedToken.userId).subscribe({
            next: (user) => {
              console.log('Current user:', user);
              this.currentUserCollegeCampusID = user.CollegeCampusID;
              console.log('Set currentUserCollegeCampusID:', this.currentUserCollegeCampusID);
              this.campusContextService.updateCampus(this.currentUserCollegeCampusID);
              this.loadDepartments();
            },
            error: (error) => {
              console.error('Error fetching current user details:', error);
            }
          });
        } else {
          console.error('No user ID found in token');
        }
      }
    });
  }

  loadDepartmentsForCampus(campusId: number): void {
    console.log('Loading departments for campus ID:', campusId);
    this.departmentService.getDepartments(campusId).subscribe({
      next: departments => {
        console.log('Fetched departments:', departments);
        this.departments = departments;
        this.newAccountForm.get('DepartmentID')?.setValue('');
        if (departments.length === 0) {
          console.log('No departments found for this campus');
        }
      },
      error: error => {
        console.error('Error fetching departments', error);
      }
    });
  }
}
