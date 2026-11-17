# research/INDEX.md — navigare cercetare

Citește doar nota lecției de care ai nevoie (`research/notes/<lecție>.md`). Nu citi integral directorul. Notele per lecție există pentru capitolul de suport M0 (M0.1, M0.3, M0.4, M0.5) și pentru capitolele C1 (L1.1–L1.11), C2 (L2.1–L2.5), C3 (L3.1–L3.5) și C4 (L4.1–L4.10) și C5 (L5.1–L5.6) , C6 (L6.1–L6.5), C7 (L7.1–L7.4) C8 (L8.1–L8.4) C9 (L9.1–L9.4) și C10 (L10.1–L10.8); sunt „parțiale”: scrise fără acces la un sistem RHEL 10, cu secțiune de nesigurante.

## Fișiere
| Fișier | Conținut |
|---|---|
| `objectives/SOURCES.md` | sursa oficială a obiectivelor, amprente |
| `objectives/ex200-verification.md` | raportul de verificare a celor 62 de obiective |
| `notes/<lecție>.md` | notă de cercetare per lecție (M0.1, M0.3, M0.4, M0.5, L1.1–L1.11, L2.1–L2.5, L3.1–L3.5, L4.1–L4.10, L5.1–L5.6, L6.1–L6.5, L7.1–L7.4, L8.1–L8.4, L9.1–L9.4, L10.1–L10.8; la C2, C4, C5, C6, C7, C8, C9 și C10 paginile docs.redhat.com au dat HTTP 403 la 2026-11-16, deci necitite) |

## Reguli (procedura completă: `docs/WORKFLOW.md`)
Surse în ordine: documentația RHEL 10; man pages; documentația upstream (systemd, LVM, XFS, SELinux, NetworkManager, firewalld); RFC-uri. Nu se amestecă versiuni vechi ale examenului.

## Documentația oficială RHEL 10 (index citit la 2026-11-15)
Index: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10 (listează release notes 10.0–10.3; examenul spune doar „RHEL 10”). Pagini: `https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/<slug>`. Titlurile de mai jos sunt cele de pe index; **harta categorie → ghid este o direcție de cercetare, nu o afirmație verificată despre conținut** (conținutul se citește la cercetarea lecției). Căutarea mea după cuvinte-cheie în titluri nu e exhaustivă.

| Cat. | Ghid / capitol (titlu oficial) | `<slug>` |
|---|---|---|
| C1 SSH | Secure communication between two systems with OpenSSH | `secure-using_secure_communications_between_two_systems_with_openssh` |
| C2 | Install, upgrade, and remove packages to provision and maintain your system (guide) | `administer-install_upgrade_and_remove_packages_to_provision_and_maintain_your_system` |
| C2 | Configure DNF · Add and configure custom software repositories · Install RHEL content · Update RHEL content · Remove unnecessary RHEL content · DNF command reference | `administer-configuring_dnf`, `…-add_and_configure_custom_software_repositories`, `…-installing_rhel_content`, `…-updating_rhel_content`, `…-removing_rhel_content`, `…-dnf_commands_list` |
| C2 Flatpak | Install applications by using Flatpak · The Flatpak technology · Set up Flatpak · Enable the Red Hat Flatpak remote on an unsubscribed system · Search for Flatpak applications | `administer-installing_applications_by_using_flatpak`, `administer-the_flatpak_technology`, `administer-setting_up_flatpak`, `administer-enabling_the_red_hat_flatpak_remote_on_an_unsubscribed_system`, `administer-searching_for_flatpak_applications` |
| C2/C7 registrare | Register your RHEL system · Register your system by using the subscription manager | `install-registering_your_rhel_system`, `install-registering_your_system_using_the_command_line` |
| C4 | Manage system services and boot behavior (guide): Manage system services with systemctl · Boot into a target system state · Shut down, suspend, and hibernate the system · Configure kernel command-line parameters · Reinstall GRUB | `administer-manage_system_services_and_boot_behavior` (capitole: `administer-managing_system_services_with_systemctl`, `…-booting_into_a_target_system_state`, `…-shutting_down_suspending_and_hibernating_the_system`, `…-configuring_kernel_command_line_parameters`, `…-reinstalling_grub`) |
| C4 | Boot to rescue mode · Recover a system with rescue mode | `administer-booting_to_rescue_mode`, `install-using_rescue_mode` |
| C4 | Optimize system performance with TuneD · Tune scheduling policy | `optimize-optimizing_system_performance_with_tuned`, `optimize-tuning_scheduling_policy` |
| C4 | Analyze system logs to investigate issues (guide): Troubleshoot problems by using log files; The Rsyslog logging service; Configure persistent logging by using the journald RHEL system role | `observe-analyze_system_logs_to_investigate_issues`, `observe-troubleshooting_problems_by_using_log_files`, `observe-the_rsyslog_logging_service`, `administer-configuring_persistent_logging_by_using_the_journald_rhel_system_role` |
| C4 | Secure communication between two systems with OpenSSH (transfer de fișiere) | vezi C1 |
| C5 | Manage storage devices (guide): Disk partitions · Get started with partitions · Get started with swap | `storage-manage_storage_devices`, `storage-disk_partitions`, `storage-getting_started_with_partitions`, `storage-getting_started_with_swap` |
| C5 | Configure and manage logical volumes (guide): Manage LVM physical volumes · Manage LVM volume groups · Create / Resize / Remove logical volumes | `storage-configure_and_manage_logical_volumes`, `storage-managing_lvm_physical_volumes`, `storage-managing_lvm_volume_groups`, `storage-creating_logical_volumes`, `storage-resizing_logical_volumes`, `storage-removing_logical_volumes` |
| C5/C6 | Manage file systems (guide): Overview of persistent naming attributes · Partition operations with parted · Persistently mount file systems · Mount file systems | `storage-manage_file_systems`, `storage-overview_of_persistent_naming_attributes`, `storage-partition_operations_with_parted`, `storage-persistently_mounting_file_systems`, `storage-mounting_file_systems` |
| C6 | Get started with XFS · Create an XFS file system · Increase the size of an XFS file system · Get started with an ext4 file system · Mount file systems on demand (autofs) | `storage-getting_started_with_xfs`, `storage-creating_an_xfs_file_system`, `storage-increasing_the_size_of_an_xfs_file_system`, `storage-getting_started_with_an_ext4_file_system`, `storage-mounting_file_systems_on_demand` |
| C6 | Share and access network storage (guide): Mount NFS shares | `storage-provision_and_manage_cross_platform_network_file_services`, `storage-mounting_nfs_shares` |
| C7 | Maintain accurate system time (guide): Introduction to chrony suite · Configure and manage chrony for time synchronization | `administer-maintain_accurate_system_time`, `administer-introduction_to_chrony_suite`, `administer-using_chrony` |
| C8 | Establish and maintain network connectivity (guide): Configure network connections and interface types · Configure host identification and DNS resolution · Change a hostname by using hostnamectl | `network-establish_and_maintain_network_connectivity`, `network-configuring_network_connections_and_interface_types`, `network-configuring_host_identification_and_dns_resolution`, `network-changing_a_hostname_by_using_hostnamectl` |
| C8/C10 | Protect network boundaries and transit data (guide): Use and configure firewalld | `secure-protect_network_boundaries_and_transit_data`, `secure-using_and_configuring_firewalld` |
| C9 | Configure user privileges and command permissions by managing sudo access (în ghidul Secure and harden base systems) | `secure-managing_sudo_access` |
| C10 | Control how users and processes interact with files (guide, SELinux): Get started with SELinux · Change SELinux states and modes · Configure SELinux for applications and services with non-standard configurations · Troubleshoot problems related to SELinux | `secure-control_how_users_and_processes_interact_with_files`, `secure-getting_started_with_selinux`, `secure-changing_selinux_states_and_modes`, `secure-configuring_selinux_for_applications_and_services_with_non_standard_configurations`, `secure-troubleshooting_problems_related_to_selinux` |

**Lacune observate (titluri):** nu am găsit, după titlu, ghiduri dedicate pentru conturi locale și grupuri, cron/at/systemd timers, journalctl, procese/nice, shell/redirecționare/grep/tar, permisiuni și umask, scripting bash. Pentru ele sursele primare vor fi **man pages** (`useradd`, `chage`, `crontab`, `at`, `systemd.timer`, `journalctl`, `nice`, `bash`, `grep`, `tar`, `chmod`, `umask`) și documentația upstream; se confirmă la cercetarea fiecărei lecții (o căutare mai adâncă în secțiunile ghidurilor poate găsi pagini relevante).

Starea fiecărei lecții: `docs/CURRENT_STATE.md`.
