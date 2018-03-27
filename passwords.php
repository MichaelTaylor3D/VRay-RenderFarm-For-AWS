if ( !function_exists('wp_check_password') ){
  function wp_check_password($password, $hash, $user_id = '') {
        global $wp_hasher;
              
        // If the hash is archvision md5
        $salt = 'xLu0VSDnlFU=';
        $saltedPassword = $password + $salt;
        $hashedUserInputPassword = join('-', str_split(md5($saltedPassword), 2));
    
        $md5len = 32;
        $numDashes = 15;
        $archvisionMd5 = $md5len + $numDashes;
        if ( strlen($hash) <=  $archvisionMd5 ) {
            $check = hash_equals( $hash, $hashedUserInputPassword );
            /**
             * Filters whether the plaintext password matches the encrypted password.
             *
             * @since 2.5.0
             *
             * @param bool       $check    Whether the passwords match.
             * @param string     $password The plaintext password.
             * @param string     $hash     The hashed password.
             * @param string|int $user_id  User ID. Can be empty.
             */
            return apply_filters('check_password', $check, $saltedPassword, $hash, $user_id);
        }
    
        // If the hash is still old wordpress md5...
        if ( strlen( $hash ) <= 32 ) {
            $check = hash_equals( $hash, md5( $password ) );
            if ( $check && $user_id ) {
                // Rehash using new hash.
                wp_set_password( $password, $user_id );
              $hash = wp_hash_password( $password );
            }
    
            /**
            * Filters whether the plaintext password matches the encrypted password.
            *
            * @since 2.5.0
            *
            * @param bool       $check    Whether the passwords match.
            * @param string     $password The plaintext password.
            * @param string     $hash     The hashed password.
            * @param string|int $user_id  User ID. Can be empty.
            */
            return apply_filters( 'check_password', $check, $password, $hash, $user_id );
        }
      
        // If the stored hash is longer than an MD5, presume the
        // new style phpass portable hash.
        if ( empty( $wp_hasher ) ) {
            require_once( ABSPATH . WPINC . '/class-phpass.php' );
            // By default, use the portable hash from phpass
            $wp_hasher = new PasswordHash( 8, true );
        }

        $check = $wp_hasher->CheckPassword( $password, $hash );
	
        /** This filter is documented in wp-includes/pluggable.php */
        return apply_filters( 'check_password', $check, $password, $hash, $user_id );
    }
}

function wp_set_encrypted_password( $encryptedPassword, $user_id ) {
  global $wpdb;
	
  $wpdb->update($wpdb->users, array('user_pass' => $encryptedPassword, 'user_activation_key' => ''), array('ID' => $user_id) );
	
  wp_cache_delete($user_id, 'users');
}
