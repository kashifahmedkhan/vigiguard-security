/**
 * Vigil Security Admin JavaScript
 *
 * @package Vigil_Security
 */

(function($) {
	'use strict';

	/**
	 * Initialize when document is ready.
	 */
	$(document).ready(function() {
		
		/**
		 * Handle "Fix All Issues" button click.
		 */
		$('.vigil-fix-all-btn').on('click', function(e) {
			e.preventDefault();
			
			const $button = $(this);
			const originalHtml = $button.html();
			
			// Confirm before proceeding.
			if (!confirm('This will automatically enable all recommended security features. Continue?')) {
				return;
			}
			
			// Disable button and show loading state.
			$button.prop('disabled', true);
			$button.html('<span class="dashicons dashicons-update spin"></span> Applying fixes...');
			
			// Send AJAX request.
			$.ajax({
				url: vigilSecurity.ajaxUrl,
				type: 'POST',
				data: {
					action: 'vigil_fix_all_issues',
					nonce: vigilSecurity.nonce
				},
				success: function(response) {
					if (response.success) {
						// Show success message.
						$button.html('<span class="dashicons dashicons-yes"></span> All Fixed!');
						$button.css('background-color', '#10b981');
						
						// Show success notice.
						showSuccessNotice(
							'Security Enhanced!',
							'Your security score improved from ' + response.data.old_score + ' to ' + response.data.new_score + '. ' +
							response.data.issues_fixed + ' issues were fixed automatically.'
						);
						
						// Reload page after 2 seconds to show updated dashboard.
						setTimeout(function() {
							location.reload();
						}, 2000);
					} else {
						// Show error.
						$button.prop('disabled', false);
						$button.html(originalHtml);
						alert('Error: ' + response.data.message);
					}
				},
				error: function() {
					// Show error.
					$button.prop('disabled', false);
					$button.html(originalHtml);
					alert('An error occurred. Please try again.');
				}
			});
		});

		/**
		 * Show success notice at top of page.
		 */
		function showSuccessNotice(title, message) {
			const notice = $('<div class="notice notice-success is-dismissible">')
				.html('<p><strong>' + title + '</strong><br>' + message + '</p>');
			
			$('.vigil-wrap').prepend(notice);
			
			// Scroll to top.
			$('html, body').animate({ scrollTop: 0 }, 300);
		}

		/**
		 * Add spinning animation to dashicons.
		 */
		const style = document.createElement('style');
		style.innerHTML = `
			@keyframes spin {
				from { transform: rotate(0deg); }
				to { transform: rotate(360deg); }
			}
			.dashicons.spin {
				animation: spin 1s linear infinite;
			}
		`;
		document.head.appendChild(style);

	});

})(jQuery);