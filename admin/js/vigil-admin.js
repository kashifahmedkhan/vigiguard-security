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
			const $healthCard = $('.vigil-health-card');
			const $issuesCard = $('.vigil-issues-card');
			const $scoreCircle = $('.vigil-score-circle');
			const $scoreGrade = $('.vigil-score-grade');
			const $scoreNumber = $('.vigil-score-number');
			const $scoreStatus = $('.vigil-score-status span');
			const $progressFill = $('.vigil-progress-fill');
			
			// Disable button and show loading state
			$button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Applying fixes...');
			
			// Add loading overlay to cards
			$healthCard.css('opacity', '0.6');
			$issuesCard.css('opacity', '0.6');
			
			// Send AJAX request
			$.ajax({
				url: vigilSecurity.ajaxUrl,
				type: 'POST',
				data: {
					action: 'vigil_fix_all_issues',
					nonce: vigilSecurity.nonce
				},
				success: function(response) {
					if (response.success) {
						const data = response.data;
						
						// Animate the score change
						animateScoreChange(data, $scoreCircle, $scoreGrade, $scoreNumber, $scoreStatus, $progressFill);
						
						// Update button to success state
						$button.html('<span class="dashicons dashicons-yes"></span> All Fixed!').css({
							'background-color': '#10b981',
							'border-color': '#10b981'
						});
						
						// Remove loading overlay
						$healthCard.css('opacity', '1');
						$issuesCard.css('opacity', '1');
						
						// Show success banner at top
						showSuccessBanner(data);
						
						// Replace issues list with success message
						setTimeout(function() {
							$issuesCard.find('.vigil-card-body').fadeOut(300, function() {
								$(this).html(`
									<div class="vigil-no-issues">
										<span class="dashicons dashicons-yes-alt"></span>
										<p>No security issues detected!</p>
									</div>
								`).fadeIn(300);
							});
						}, 800);
						
						// Update stats cards
						updateStatsCards();
						
					} else {
						// Show error
						$button.prop('disabled', false).html('<span class="dashicons dashicons-shield"></span> Fix All Issues (One Click)');
						$healthCard.css('opacity', '1');
						$issuesCard.css('opacity', '1');
						showErrorBanner(response.data.message);
					}
				},
				error: function() {
					// Show error
					$button.prop('disabled', false).html('<span class="dashicons dashicons-shield"></span> Fix All Issues (One Click)');
					$healthCard.css('opacity', '1');
					$issuesCard.css('opacity', '1');
					showErrorBanner('An error occurred. Please refresh and try again.');
				}
			});
		});

		/**
		 * Animate score change from old to new value.
		 */
		function animateScoreChange(data, $circle, $grade, $number, $status, $progress) {
			const oldScore = data.old_score;
			const newScore = data.new_score;
			const duration = 1500; // 1.5 seconds
			const steps = 60;
			const increment = (newScore - oldScore) / steps;
			let currentScore = oldScore;
			let step = 0;
			
			const interval = setInterval(function() {
				step++;
				currentScore += increment;
				
				if (step >= steps) {
					currentScore = newScore;
					clearInterval(interval);
				}
				
				// Update score number
				$number.text(Math.round(currentScore) + '/100');
				
				// Update progress bar
				$progress.css('width', Math.round(currentScore) + '%');
				
				// Update color and grade when we reach final score
				if (step >= steps) {
					$circle.css('border-color', data.color);
					$grade.css('color', data.color).text(data.grade);
					$status.css('color', data.color).text(data.status);
					$progress.css('background-color', data.color);
					
					// Add pulse animation
					$circle.addClass('vigil-pulse');
					setTimeout(function() {
						$circle.removeClass('vigil-pulse');
					}, 1000);
				}
			}, duration / steps);
		}

		/**
		 * Show success banner at top of page.
		 */
		function showSuccessBanner(data) {
			const $banner = $(`
				<div class="notice notice-success vigil-success-banner" style="display:none;">
					<p>
						<strong>🎉 Security Enhanced!</strong><br>
						Your security score improved from <strong>${data.old_score}</strong> to <strong>${data.new_score}</strong>. 
						${data.issues_fixed} security issues were fixed automatically.
						<a href="admin.php?page=vigil-security-settings" style="margin-left: 10px;">View Settings →</a>
					</p>
				</div>
			`);
			
			$('.vigil-wrap').prepend($banner);
			$banner.slideDown(300);
			
			// Scroll to top smoothly
			$('html, body').animate({ scrollTop: 0 }, 400);
		}

		/**
		 * Show error banner at top of page.
		 */
		function showErrorBanner(message) {
			const $banner = $(`
				<div class="notice notice-error vigil-error-banner" style="display:none;">
					<p><strong>Error:</strong> ${message}</p>
				</div>
			`);
			
			$('.vigil-wrap').prepend($banner);
			$banner.slideDown(300);
			
			// Auto-remove after 5 seconds
			setTimeout(function() {
				$banner.slideUp(300, function() { $(this).remove(); });
			}, 5000);
		}

		/**
		 * Update stats cards to reflect new settings.
		 */
		function updateStatsCards() {
			// Update "Login Protection" stat
			$('.vigil-stat-card').eq(0).find('.vigil-stat-value').fadeOut(200, function() {
				$(this).text('Active').css('color', '#10b981').fadeIn(200);
			});
			
			// Update "Hardening Rules" stat
			$('.vigil-stat-card').eq(1).find('.vigil-stat-value').fadeOut(200, function() {
				$(this).text('3/3').css('color', '#10b981').fadeIn(200);
			});
		}

		/**
		 * Add CSS animations.
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
			@keyframes pulse {
				0%, 100% { transform: scale(1); }
				50% { transform: scale(1.05); }
			}
			.vigil-pulse {
				animation: pulse 0.6s ease-in-out;
			}
			.vigil-success-banner {
				border-left: 4px solid #10b981;
			}
			.vigil-error-banner {
				border-left: 4px solid #dc2626;
			}
		`;
		document.head.appendChild(style);

		/**
		 * Handle custom dismissible notices (AJAX method).
		 */
		$(document).on('click', '.vigil-dismissible-notice .notice-dismiss', function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			const $notice = $(this).closest('.notice');
			const noticeId = $notice.data('notice-id');
			
			console.log('Dismiss clicked. Notice ID:', noticeId); // DEBUG
			
			if (!noticeId) {
				console.error('No notice ID found');
				return;
			}
			
			// Immediately hide the notice (optimistic)
			$notice.fadeOut(200, function() {
				$(this).remove();
			});
			
			console.log('Sending AJAX request...'); // DEBUG
			
			// Send AJAX to save dismissal
			$.ajax({
				url: vigilSecurity.ajaxUrl,
				type: 'POST',
				data: {
					action: 'vigil_dismiss_notice',
					nonce: vigilSecurity.nonce,
					notice_id: noticeId
				},
				success: function(response) {
					console.log('AJAX Response:', response); // DEBUG
					if (!response.success) {
						console.error('Failed to save notice dismissal:', response);
					}
				},
				error: function(xhr, status, error) {
					console.error('AJAX error:', status, error); // DEBUG
				}
			});
		});

	});

})(jQuery);