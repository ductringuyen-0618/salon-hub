package com.salonhub.api.config;

import com.salonhub.api.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

/**
 * WebSocket channel interceptor for JWT authentication.
 * 
 * Authentication Strategy:
 * - Public subscriptions: /topic/queue is accessible without authentication for display boards
 * - Authenticated actions: /app/queue/admin/* requires valid JWT token
 * 
 * Token can be passed via:
 * - STOMP CONNECT frame header: Authorization: Bearer <token>
 * - Query parameter on initial connection (for SockJS): ?token=<token>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Public destinations that don't require authentication
    private static final String[] PUBLIC_DESTINATIONS = {
            "/topic/queue",
            "/topic/queue/stats"
    };

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        
        if (command == null) {
            return message;
        }

        switch (command) {
            case CONNECT:
                // Attempt to authenticate on connection
                authenticateConnection(accessor);
                break;
                
            case SUBSCRIBE:
                // Check if subscription destination requires authentication
                String destination = accessor.getDestination();
                if (destination != null && !isPublicDestination(destination)) {
                    if (accessor.getUser() == null) {
                        log.warn("Unauthenticated subscription attempt to protected destination: {}", destination);
                        // Allow the subscription but they won't receive protected messages
                    }
                }
                break;
                
            case SEND:
                // Sending messages to /app/* destinations requires authentication
                String sendDestination = accessor.getDestination();
                if (sendDestination != null && sendDestination.startsWith("/app/queue/admin")) {
                    if (accessor.getUser() == null) {
                        log.warn("Unauthenticated send attempt to admin destination: {}", sendDestination);
                        throw new SecurityException("Authentication required for admin operations");
                    }
                }
                break;
                
            default:
                break;
        }

        return message;
    }

    private void authenticateConnection(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No valid Authorization header found in WebSocket CONNECT frame");
            return;
        }

        String jwt = authHeader.substring(7);
        
        try {
            String userEmail = jwtService.extractUsername(jwt);
            
            if (userEmail != null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    
                    accessor.setUser(authToken);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("WebSocket connection authenticated for user: {}", userEmail);
                } else {
                    log.warn("Invalid JWT token in WebSocket connection");
                }
            }
        } catch (Exception e) {
            log.warn("Failed to authenticate WebSocket connection: {}", e.getMessage());
        }
    }

    private boolean isPublicDestination(String destination) {
        if (destination == null) {
            return false;
        }
        
        for (String publicDest : PUBLIC_DESTINATIONS) {
            if (destination.equals(publicDest) || destination.startsWith(publicDest + "/")) {
                return true;
            }
        }
        
        return false;
    }
}
