
if ( !function_exists('wp_check_password') ){
  function wp_check_password($password, $hash, $user_id = '') {
    global $wp_hasher;
    $salt = 'ADD YOUR SALT HERE';
    $saltedPassword = $password + $salt;
              
    // If the hash is still md5...
    if ( strlen($hash) <= 32 ) {
      $check = ( $hash == md5($saltedPassword) );
      if ( $check && $user_id ) {
        // Rehash using new hash.
        wp_set_password($saltedPassword, $user_id);
        $hash = wp_hash_password($saltedPassword);
      }

      return apply_filters('check_password', $check, $saltedPassword, $hash, $user_id);
    }
      
    // If the stored hash is longer than an MD5, presume the
    // new style phpass portable hash.
    if ( empty($wp_hasher) ) {
      require_once( ABSPATH . 'wp-includes/class-phpass.php');
      // By default, use the portable hash from phpass
      $wp_hasher = new PasswordHash(8, TRUE);
    }

    $check = $wp_hasher->CheckPassword($password, $hash);
    return apply_filters('check_password', $check, $password, $hash, $user_id);
  }
}

function wp_set_encrypted_password( $encryptedPassword, $user_id ) {
  global $wpdb;
	
  $wpdb->update($wpdb->users, array('user_pass' => $encryptedPassword, 'user_activation_key' => ''), array('ID' => $user_id) );
	
  wp_cache_delete($user_id, 'users');
}
